"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Scale, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  X,
  Cloud,
  FileUp,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AnalyzeReportPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [results, setResults] = useState<any[]>([]); // Store analysis results per file
  const [errors, setErrors] = useState<string[]>([]);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const { user } = useAuth();

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
    const allowed = files.filter(file => ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type));
    if (allowed.length !== files.length) {
      setUploadStatus("error");
      return;
    }
    setUploadedFiles(prev => [...prev, ...allowed]);
    setUploadStatus("idle");
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0 || uploading) return;
    setUploading(true);
    setUploadStatus("idle");
    setResults([]);
    setErrors([]);
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setProgressMsg(`Analyzing ${file.name} (${i + 1}/${uploadedFiles.length})...`);
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/analyze-document', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setErrors(prev => [...prev, `${file.name}: ${json.error || 'Unknown error'}`]);
        } else {
          setResults(prev => [...prev, { fileName: file.name, data: json.data }]);
        }
      }
      setUploadStatus(errors.length === 0 ? 'success' : 'error');
    } catch (e: any) {
      setUploadStatus('error');
      setErrors(prev => [...prev, e?.message || 'Unexpected error']);
    } finally {
      setProgressMsg("");
      setUploading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/15 to-pink-600/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
              <Scale className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">LegalAI</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Document Analysis</p>
            </div>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Page Header */}
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-4 py-2 shadow-sm">
              <FileText className="h-5 w-5 mr-2" />
              Professional Legal Analysis
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">
                Analyze & Transform
              </span>
              <br />
              Legal Documents
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Upload your legal documents and receive comprehensive AI-powered analysis with insights, 
              compliance checks, and actionable recommendations in minutes.
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div variants={fadeInUp}>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-gray-900/10 dark:shadow-black/20 rounded-2xl">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white font-bold">
                      Upload Legal Documents
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 text-base mt-1">
                      Drag and drop PDF files or click to browse. Maximum file size: 10MB per file.
                    </CardDescription>
                  </div>
                </div>
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
                    multiple
                    accept=".pdf,.docx"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-6"
                      animate={{ 
                        scale: dragActive ? 1.1 : 1,
                        rotate: dragActive ? 5 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25 inline-block">
                        <Cloud className="h-16 w-16 text-white" />
                      </div>
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {dragActive ? "Drop your files here" : "Choose files or drag and drop"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                      PDF or DOCX files, up to 10MB each
                    </p>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-blue-500 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold px-8 py-4 text-lg shadow-lg shadow-blue-500/10"
                    >
                      <FileUp className="h-5 w-5 mr-3" />
                      Browse Files
                    </Button>
                  </div>
                </div>

                {/* Status Messages */}
                {uploadStatus === "error" && (
                  <Alert className="mt-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 shadow-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertDescription className="text-base font-medium">
                      Please upload only PDF files. Some files were not added.
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === "success" && (
                  <Alert className="mt-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 shadow-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <AlertDescription className="text-base font-medium">
                      Files uploaded successfully! Analysis will begin shortly.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Uploaded Files</h4>
                    <div className="space-y-4">
                      {uploadedFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-md"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <p className="text-gray-900 dark:text-white font-semibold text-base">{file.name}</p>
                              <p className="text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Upload Button */}
                    <div className="mt-8 text-center">
                      <Button
                        onClick={handleUpload}
                        disabled={uploading || uploadedFiles.length === 0}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-4 text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 transition-all duration-200"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                            {progressMsg || 'Analyzing...'}
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-3" />
                            Start Professional Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 shadow-lg">
                  <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                    What happens next?
                  </h4>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-base">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 font-bold">•</span>
                      Your documents will be securely processed by our advanced AI
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-600 mr-2 font-bold">•</span>
                      We'll extract key clauses, terms, and legal provisions
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-2 font-bold">•</span>
                      You'll receive a comprehensive analysis report with insights
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2 font-bold">•</span>
                      All uploads are encrypted and automatically deleted after processing
                    </li>
                  </ul>
                </div>

                {errors.length > 0 && (
                  <Alert className="mt-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 shadow-lg">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <AlertDescription className="text-base font-medium space-y-1">
                      {errors.map((e,i) => <div key={i}>{e}</div>)}
                    </AlertDescription>
                  </Alert>
                )}

                {results.length > 0 && (
                  <div className="mt-12 space-y-10">
                    {results.map((r, idx) => {
                      const d = r.data || {};
                      const summary = d.summary || {};
                      const classification = d.classification || {};
                      return (
                        <Card key={idx} className="border border-blue-200 dark:border-blue-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-xl">Analysis Result: {r.fileName}</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Document Type: <span className="font-semibold">{summary.document_type || classification.primary_classification || 'Unknown'}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                                <p className="font-semibold mb-1">Classification Confidence</p>
                                <p>{classification.confidence_score ?? '—'}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-600/10">
                                <p className="font-semibold mb-1">Clauses Analyzed</p>
                                <p>{d.clauses?.total_found ?? '—'}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-blue-600/10">
                                <p className="font-semibold mb-1">Pages</p>
                                <p>{d.document_info?.pages ?? '—'}</p>
                              </div>
                            </div>
                            {summary.key_clauses?.length > 0 && (
                              <div>
                                <p className="font-semibold mb-3">Top Simplified Clauses</p>
                                <ul className="space-y-3 text-sm">
                                  {summary.key_clauses.slice(0,5).map((c: any) => (
                                    <li key={c.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
                                      <p className="text-xs text-gray-500 mb-1">Clause {c.id} • {c.type}</p>
                                      <p className="font-medium leading-relaxed">{c.simplified}</p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-3">
                              {summary.main_parties?.length > 0 && (
                                <div className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">
                                  Parties: {summary.main_parties.map((p: any) => p.text).join(', ')}
                                </div>
                              )}
                              {summary.important_dates?.length > 0 && (
                                <div className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full">
                                  Dates: {summary.important_dates.map((p: any) => p.text).join(', ')}
                                </div>
                              )}
                            </div>
                            <div className="pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${r.fileName.replace(/\.[^.]+$/, '')}_analysis.json`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                Download JSON
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-2"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/api/export-word', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ results: r.data })
                                    });
                                    if (!res.ok) {
                                      throw new Error('Failed to generate Word document');
                                    }
                                    const blob = await res.blob();
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${r.fileName.replace(/\.[^.]+$/, '')}_analysis.docx`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  } catch (e) {
                                    console.error(e);
                                    alert('Word export failed');
                                  }
                                }}
                              >
                                Download Word
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}