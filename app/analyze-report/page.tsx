"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileDown,
  ArrowLeft,
  Scale,
  Users,
  Calendar,
  Hash,
  BookOpen
} from "lucide-react";
import Link from "next/link";

interface AnalysisResults {
  document_info: {
    pages: number;
    total_characters: number;
    total_words: number;
    processed_date: string;
  };
  classification: {
    primary_classification: string;
    confidence_score: number;
    detected_keywords: Array<{ keyword: string; count: number }>;
    alternative_classifications: Array<{ type: string; score: number }>;
  };
  clauses: {
    total_found: number;
    detailed_analysis: Array<{
      id: number;
      text: string;
      simplified: string;
      word_count: number;
      char_count: number;
      type: string;
      complexity_reduction: number;
    }>;
  };
  entities: {
    persons: Array<{ text: string; confidence: number; type: string }>;
    organizations: Array<{ text: string; confidence: number; type: string }>;
    dates: Array<{ text: string; confidence: number; type: string }>;
    locations: Array<{ text: string; confidence: number; type: string }>;
  };
  summary: {
    document_type: string;
    confidence: number;
    key_clauses: Array<any>;
    main_parties: Array<any>;
    important_dates: Array<any>;
  };
}

export default function AnalyzeReportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error" | "analyzing">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files));
    }
  }, []);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    
    const selectedFile = files[0];
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus("error");
      setErrorMessage("Please upload only PDF or DOCX files.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadStatus("error");
      setErrorMessage("File size must be less than 10MB.");
      return;
    }

    setFile(selectedFile);
    setUploadStatus("idle");
    setErrorMessage("");
    setAnalysisResults(null);
  };

  const removeFile = () => {
    setFile(null);
    setAnalysisResults(null);
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    setUploadStatus("analyzing");
    setAnalysisProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      const result = await response.json();
      
      // Normalize API response to the UI's expected shape
      const normalizeResults = (data: any): AnalysisResults => {
        const classificationLabel = data?.classification?.label || data?.classification?.primary_classification || 'Unknown';
        const classificationConfidence = data?.classification?.confidence ?? 0;
        const classificationCandidates = data?.classification?.candidates || [];
        const detectedKeywords = Array.isArray(data?.classification?.detected_keywords) ? data.classification.detected_keywords : [];

        const clausesArr = Array.isArray(data?.clauses) ? data.clauses : (data?.clauses?.detailed_analysis || []);
        const detailedClauses = (clausesArr || []).map((c: any, i: number) => {
          const original = typeof c?.text === 'string' ? c.text : '';
          const simplified = typeof c?.simplified === 'string' ? c.simplified : '';
          const ow = original ? original.trim().split(/\s+/).length : 0;
          const sw = simplified ? simplified.trim().split(/\s+/).length : 0;
          const reduction = ow > 0 && sw > 0 ? Math.max(0, Math.round(((ow - sw) / ow) * 100)) : 0;
          return {
            id: c?.id ?? i + 1,
            text: original,
            simplified: simplified,
            word_count: c?.word_count ?? ow,
            char_count: c?.char_count ?? (original.length || 0),
            type: c?.type || 'General',
            complexity_reduction: c?.complexity_reduction ?? reduction,
          };
        });

        const ent = data?.entities || {};
        const wrapEnt = (arr: any[], type: string) => (Array.isArray(arr) ? arr : [])
          .slice(0, 100)
          .map((t) => {
            if (t && typeof t === 'object') {
              return {
                text: t.text ?? String(t.word ?? ''),
                confidence: typeof t.confidence === 'number' ? t.confidence : (typeof t.score === 'number' ? t.score : 1),
                type,
              };
            }
            return { text: String(t), confidence: 1, type };
          });

        return {
          document_info: {
            pages: data?.document_info?.pages || Math.max(1, Math.round(((data?.document_info?.word_count || 0) / 500))) || 1,
            total_characters: data?.document_info?.char_count ?? data?.document_info?.total_characters ?? 0,
            total_words: data?.document_info?.word_count ?? data?.document_info?.total_words ?? 0,
            processed_date: new Date().toISOString(),
          },
          classification: {
            primary_classification: classificationLabel,
            // Prefer sum of detected keyword counts; else use confidence percentage
            confidence_score: detectedKeywords.length > 0 ? detectedKeywords.reduce((a: number, k: any) => a + (k?.count || 0), 0) : Math.round((classificationConfidence || 0) * 100),
            detected_keywords: detectedKeywords,
            alternative_classifications: (data?.classification?.alternative_classifications || (classificationCandidates || []).map((c: any) => ({ type: c.label, score: c.score }))),
          },
          clauses: {
            total_found: detailedClauses.length,
            detailed_analysis: detailedClauses,
          },
          entities: {
            persons: wrapEnt(ent.persons || [], 'PERSON'),
            organizations: wrapEnt(ent.organizations || [], 'ORG'),
            dates: wrapEnt(ent.dates || [], 'DATE'),
            locations: wrapEnt(ent.locations || [], 'LOC'),
          },
          summary: {
            document_type: classificationLabel,
            confidence: data?.classification?.confidence_score ?? classificationConfidence,
            key_clauses: detailedClauses.slice(0, 3),
            main_parties: wrapEnt(ent.persons || [], 'PERSON'),
            important_dates: wrapEnt(ent.dates || [], 'DATE'),
          },
        };
      };

      if (result.success) {
        const normalized = normalizeResults(result.data);
        setAnalysisResults(normalized);
        setUploadStatus("success");
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setUploadStatus("error");
      setErrorMessage("Failed to analyze document. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!analysisResults) return;

    try {
      const response = await fetch('/api/export-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ results: analysisResults }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `legal-analysis-report-${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setErrorMessage("Failed to download report. Please try again.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
          </div>
          
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-6 glass-card bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm text-white border border-white/20">
              <FileText className="h-4 w-4 mr-2" />
              Legal Document Analysis
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                Analyze & Transform
              </span>
              <br />
              Legal Documents
            </h1>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Upload your PDF or DOCX documents and get comprehensive analysis including clause simplification, document classification, and entity extraction.
            </p>
          </div>

          {!analysisResults ? (
            /* Upload Section */
            <Card className="glass-card bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Upload className="h-6 w-6 mr-3" />
                  Upload Legal Document
                </CardTitle>
                <CardDescription className="text-white/60">
                  Upload a PDF or DOCX file for comprehensive legal analysis. Maximum file size: 10MB.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-12 transition-all duration-300 ${
                    dragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-lg shadow-blue-500/25"
                      : "border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf,.docx"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="text-center">
                    <div className="mx-auto mb-4">
                      <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 inline-block">
                        <Upload className="h-12 w-12 text-blue-400" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {dragActive ? "Drop your file here" : "Choose a file or drag and drop"}
                    </h3>
                    <p className="text-white/60 mb-4">
                      PDF or DOCX files only, up to 10MB
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-blue-500 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold px-8 py-4 text-lg shadow-lg shadow-blue-500/10"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>

                {/* Error Messages */}
                {uploadStatus === "error" && (
                  <Alert className="mt-4 bg-red-500/10 border-red-500/50 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Analysis Progress */}
                {uploadStatus === "analyzing" && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Analyzing document...</span>
                      <span className="text-white/60">{Math.round(analysisProgress)}%</span>
                    </div>
                    <Progress value={analysisProgress} className="mb-4" />
                    <div className="text-center text-white/60 text-sm">
                      This may take a few moments depending on document size
                    </div>
                  </div>
                )}

                {/* Uploaded File */}
                {file && uploadStatus !== "analyzing" && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Ready to Analyze</h4>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded bg-blue-500/20">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Analyze Button */}
                    <div className="mt-6 text-center">
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing || !file}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 shadow-lg shadow-blue-500/25"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            Analyzing Documents...
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Start Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Features Info */}
                <div className="mt-8 grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      What We Analyze
                    </h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Document type classification</li>
                      <li>• Clause extraction and breakdown</li>
                      <li>• Legal language simplification</li>
                      <li>• Entity recognition (parties, dates)</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <h4 className="text-white font-semibold mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Privacy & Security
                    </h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Documents processed securely</li>
                      <li>• No data stored permanently</li>
                      <li>• Files deleted after analysis</li>
                      <li>• End-to-end encryption</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Results Section */
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Analysis Results</h2>
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadReport}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                  <Button
                    onClick={() => {
                      setAnalysisResults(null);
                      setFile(null);
                      setUploadStatus("idle");
                      setErrorMessage("");
                    }}
                    variant="outline"
                    className="border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    New Analysis
                  </Button>
                </div>
              </div>

              {/* Overview Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="glass-card bg-blue-500/10 border-blue-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Document Type</p>
                        <p className="text-white font-semibold text-lg">{analysisResults.classification.primary_classification}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-green-500/10 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Total Pages</p>
                        <p className="text-white font-semibold text-lg">{analysisResults.document_info.pages}</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-purple-500/10 border-purple-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Clauses Found</p>
                        <p className="text-white font-semibold text-lg">{analysisResults.clauses.total_found}</p>
                      </div>
                      <Hash className="h-8 w-8 text-purple-400" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-orange-500/10 border-orange-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">Entities Found</p>
                        <p className="text-white font-semibold text-lg">
                          {Object.values(analysisResults.entities).reduce((sum, arr) => sum + arr.length, 0)}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-orange-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results - Simplified Version */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="glass-card bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Key Clauses (Simplified)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(analysisResults?.clauses?.detailed_analysis || []).slice(0, 3).map((clause) => (
                        <div key={clause.id} className="p-3 bg-white/5 rounded-lg border border-white/10">
                          <Badge variant="secondary" className="mb-2">{clause.type}</Badge>
                          <p className="text-white/70 text-sm mb-2">
                            <strong>Original:</strong> {clause.text.substring(0, 100)}...
                          </p>
                          <p className="text-white text-sm">
                            <strong>Simplified:</strong> {clause.simplified.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card bg-white/5 backdrop-blur-xl border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Document Classification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-white font-medium">{analysisResults.classification.primary_classification}</p>
                        <p className="text-white/60 text-sm">{analysisResults.classification.confidence_score} keyword matches</p>
                      </div>
                      
                      <div>
                        <p className="text-white font-medium mb-2">Key Indicators:</p>
                        <div className="flex flex-wrap gap-1">
                          {(analysisResults.classification.detected_keywords || []).slice(0, 8).map((keyword, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {keyword.keyword} ({keyword.count})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
