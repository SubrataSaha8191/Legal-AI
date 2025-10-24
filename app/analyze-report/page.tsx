"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { generateAnalysisWordDoc } from "@/utils/docxGenerator";
import AnimatedBackground from "@/components/AnimatedBackground";
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
  Loader2,
  Sparkles,
  ListTree,
  FileSearch,
  Download,
  ChevronDown,
  ChevronUp
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
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  
  // Analysis progress tracking
  const [analysisSteps, setAnalysisSteps] = useState<{
    uploading: 'idle' | 'loading' | 'completed';
    extracting: 'idle' | 'loading' | 'completed';
    classifying: 'idle' | 'loading' | 'completed';
    simplifying: 'idle' | 'loading' | 'completed';
  }>({
    uploading: 'idle',
    extracting: 'idle',
    classifying: 'idle',
    simplifying: 'idle',
  });
  
  const { user } = useAuth();

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetAnalysisSteps = () => {
    setAnalysisSteps({
      uploading: 'idle',
      extracting: 'idle',
      classifying: 'idle',
      simplifying: 'idle',
    });
  };

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
    resetAnalysisSteps();
    
    try {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setProgressMsg(`Analyzing ${file.name} (${i + 1}/${uploadedFiles.length})...`);
        
        // Step 1: Uploading
        setAnalysisSteps(prev => ({ ...prev, uploading: 'loading' }));
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const formData = new FormData();
        formData.append('file', file);

        setAnalysisSteps(prev => ({ ...prev, uploading: 'completed', extracting: 'loading' }));

        // Try to use streaming endpoint to receive per-step updates
        try {
          const res = await fetch('/api/analyze-document', {
            method: 'POST',
            headers: { Accept: 'text/event-stream' },
            body: formData,
          });

          if (res.headers.get('content-type')?.includes('text/event-stream')) {
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let finalData: any = null;

            while (true) {
              const { done, value } = await reader!.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });

              // parse SSE-style "data: {...}\n\n"
              let parts = buffer.split('\n\n');
              for (let i = 0; i < parts.length - 1; i++) {
                const chunk = parts[i];
                const lines = chunk.split('\n').filter(Boolean);
                for (const line of lines) {
                  if (!line.startsWith('data:')) continue;
                  const payload = line.replace(/^data:\s?/, '').trim();
                  try {
                    const obj = JSON.parse(payload);
                    // Update UI based on step
                    if (obj.step === 'uploading') {
                      setAnalysisSteps(prev => ({ ...prev, uploading: obj.status === 'completed' ? 'completed' : 'loading' }));
                    } else if (obj.step === 'extracting') {
                      setAnalysisSteps(prev => ({ ...prev, extracting: obj.status === 'completed' ? 'completed' : 'loading' }));
                    } else if (obj.step === 'classifying') {
                      setAnalysisSteps(prev => ({ ...prev, classifying: obj.status === 'completed' ? 'completed' : 'loading' }));
                    } else if (obj.step === 'simplifying') {
                      setAnalysisSteps(prev => ({ ...prev, simplifying: obj.status === 'completed' ? 'completed' : 'loading' }));
                    } else if (obj.step === 'terms') {
                      // no separate UI step by default; use for progress
                    } else if (obj.step === 'error') {
                      setErrors(prev => [...prev, `${file.name}: ${obj.message || 'Analysis error'}`]);
                      resetAnalysisSteps();
                    } else if (obj.step === 'done') {
                      finalData = obj.data;
                    }
                  } catch (e) {
                    console.warn('Failed to parse SSE payload', e);
                  }
                }
              }

              buffer = parts[parts.length - 1];
            }

            // If finalData exists, push result
            if (finalData) {
              setAnalysisSteps({ uploading: 'completed', extracting: 'completed', classifying: 'completed', simplifying: 'completed' });
              setResults(prev => [...prev, { fileName: file.name, data: finalData }]);
            } else {
              setErrors(prev => [...prev, `${file.name}: No final analysis returned`]);
            }
          } else {
            // Non-streaming fallback
            const json = await res.json();
            if (!res.ok || !json.success) {
              setErrors(prev => [...prev, `${file.name}: ${json.error || 'Unknown error'}`]);
              resetAnalysisSteps();
            } else {
              setAnalysisSteps(prev => ({ ...prev, extracting: 'completed', classifying: 'completed', simplifying: 'completed' }));
              setResults(prev => [...prev, { fileName: file.name, data: json.data }]);
            }
          }
        } catch (e: any) {
          setErrors(prev => [...prev, `${file.name}: ${e?.message || 'Unexpected error during analysis'}`]);
          resetAnalysisSteps();
        }
      }
      setUploadStatus(errors.length === 0 ? 'success' : 'error');
    } catch (e: any) {
      setUploadStatus('error');
      setErrors(prev => [...prev, e?.message || 'Unexpected error']);
      resetAnalysisSteps();
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Unique Blue Background */}
      <AnimatedBackground variant="blue" />

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
                          <div className="flex items-center gap-3 max-w-full">
                            <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />
                            <span className="truncate max-w-md">
                              {progressMsg || 'Analyzing...'}
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-3" />
                            Start Professional Analysis
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Analysis Progress Tracker */}
                    {uploading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-6 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 shadow-lg"
                      >
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          Analysis Progress
                        </h4>
                        
                        <div className="space-y-4">
                          {/* Step 1: Uploading */}
                          <div className="flex items-center gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              analysisSteps.uploading === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : analysisSteps.uploading === 'loading'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {analysisSteps.uploading === 'completed' ? (
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : analysisSteps.uploading === 'loading' ? (
                                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                analysisSteps.uploading === 'completed' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : analysisSteps.uploading === 'loading'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Uploading Document
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Securely uploading your file to our servers
                              </p>
                            </div>
                          </div>

                          {/* Step 2: Extracting Clauses */}
                          <div className="flex items-center gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              analysisSteps.extracting === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : analysisSteps.extracting === 'loading'
                                ? 'bg-purple-100 dark:bg-purple-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {analysisSteps.extracting === 'completed' ? (
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : analysisSteps.extracting === 'loading' ? (
                                <Loader2 className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-spin" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                analysisSteps.extracting === 'completed' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : analysisSteps.extracting === 'loading'
                                  ? 'text-purple-700 dark:text-purple-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Extracting Clauses
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                AI identifying and extracting key legal clauses
                              </p>
                            </div>
                          </div>

                          {/* Step 3: Simplifying Clauses */}
                          <div className="flex items-center gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              analysisSteps.simplifying === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : analysisSteps.simplifying === 'loading'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {analysisSteps.simplifying === 'completed' ? (
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : analysisSteps.simplifying === 'loading' ? (
                                <Loader2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-spin" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                analysisSteps.simplifying === 'completed' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : analysisSteps.simplifying === 'loading'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Simplifying Clauses
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                AI translating legal jargon to plain English
                              </p>
                            </div>
                          </div>

                          {/* Step 4: Classifying Document */}
                          <div className="flex items-center gap-4">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              analysisSteps.classifying === 'completed' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : analysisSteps.classifying === 'loading'
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              {analysisSteps.classifying === 'completed' ? (
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                              ) : analysisSteps.classifying === 'loading' ? (
                                <Loader2 className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" />
                              ) : (
                                <div className="h-3 w-3 rounded-full bg-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${
                                analysisSteps.classifying === 'completed' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : analysisSteps.classifying === 'loading'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                Classifying Document
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                AI determining document type and categories
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600"
                              initial={{ width: '0%' }}
                              animate={{ 
                                  width: analysisSteps.classifying === 'completed' ? '100%' :
                                         analysisSteps.simplifying === 'completed' ? '75%' :
                                         analysisSteps.extracting === 'completed' ? '50%' :
                                         analysisSteps.uploading === 'completed' ? '25%' : '0%'
                                }}
                              transition={{ duration: 0.5, ease: 'easeInOut' }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
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
                  <div className="mt-12 space-y-8">
                    {results.map((r, idx) => {
                      const d = r.data || {};
                      const summary = d.summary || {};
                      const classification = d.classification || {};
                      const docInfo = d.document_info || {};
                      const clauses = d.clauses || {};
                      const legalTermsKey = `legal-terms-${idx}`;
                      const legalTermsExpanded = !!expandedSections[legalTermsKey];
                      
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="space-y-6"
                        >
                          {/* Document Header Card */}
                          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/10 shadow-xl overflow-hidden !p-0 !gap-0">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-8 !pt-6 rounded-t-lg">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-2xl font-bold  break-words">
                                    {r.fileName}
                                  </CardTitle>
                                  <CardDescription className="text-blue-100 text-base">
                                    Comprehensive AI Analysis Report
                                  </CardDescription>
                                </div>
                                <div className="ml-4 flex gap-2 flex-shrink-0">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                    onClick={async () => {
                                      try {
                                        console.log('Starting Word document generation...');
                                        console.log('Data to convert:', r.data);
                                        const blob = await generateAnalysisWordDoc(r.data, r.fileName);
                                        console.log('Blob created:', blob);
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `${r.fileName.replace(/\.[^.]+$/, '')}_analysis.docx`;
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                        console.log('Word document downloaded successfully');
                                      } catch (error) {
                                        console.error('Error generating Word document:', error);
                                        console.error('Error details:', {
                                          message: error instanceof Error ? error.message : 'Unknown error',
                                          stack: error instanceof Error ? error.stack : undefined,
                                          data: r.data
                                        });
                                        alert(`Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                      }
                                    }}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    <span className="text-xs">Word</span>
                                  </Button>
                                </div>
                              </div>

                              {/* Document Stats */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                  <p className="text-xs text-blue-100 mb-1">Pages</p>
                                  <p className="text-xl font-bold">{docInfo.pages || '—'}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                  <p className="text-xs text-blue-100 mb-1">Word Count</p>
                                  <p className="text-xl font-bold">{docInfo.word_count?.toLocaleString() || '—'}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                  <p className="text-xs text-blue-100 mb-1">File Size</p>
                                  <p className="text-xl font-bold">{formatFileSize(docInfo.size_bytes || 0)}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                  <p className="text-xs text-blue-100 mb-1">Clauses Found</p>
                                  <p className="text-xl font-bold">{clauses.total_found || '—'}</p>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="pt-8 pb-6 space-y-8">
                              {/* AI Analysis Categories Header */}
                              <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                  AI-Powered Analysis Results
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                    <FileSearch className="h-3 w-3 mr-1" />
                                    Classification
                                  </Badge>
                                  <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    <ListTree className="h-3 w-3 mr-1" />
                                    Extraction
                                  </Badge>
                                  <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Simplification
                                  </Badge>
                                </div>
                              </div>

                              {/* SECTION 1: Document Classification */}
                              <div className="space-y-4 border-l-4 border-blue-500 pl-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-blue-600 text-white px-3 py-1 text-lg font-bold">1</Badge>
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                                      <FileSearch className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        Document Classification
                                        
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        AI-powered document type identification
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSection(`classification-${idx}`)}
                                    className="text-gray-600 dark:text-gray-400"
                                  >
                                    {expandedSections[`classification-${idx}`] ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </Button>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                                  <div className="flex items-center justify-between mb-4">
                                    <div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Primary Classification</p>
                                      <p className="text-2xl font-bold text-gray-900 dark:text-white break-words">
                                        {classification.primary_classification || 'Unknown Document Type'}
                                      </p>
                                    </div>
                                    <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
                                      {classification.confidence_score || 'High Confidence'}
                                    </Badge>
                                  </div>

                                  {expandedSections[`classification-${idx}`] && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="pt-4 border-t border-blue-200 dark:border-blue-800"
                                    >
                                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        This document has been classified using advanced zero-shot classification models 
                                        that analyze the content structure, legal terminology, and clause patterns to 
                                        determine the most likely document category.
                                      </p>
                                    </motion.div>
                                  )}
                                </div>
                              </div>

                              {/* SECTION 2: Clause Extraction */}
                              <div className="space-y-4 border-l-4 border-purple-500 pl-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-purple-600 text-white px-3 py-1 text-lg font-bold">2</Badge>
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                                      <ListTree className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        Clause Extraction
                                        
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {clauses.total_found || 0} clauses identified and categorized
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSection(`extraction-${idx}`)}
                                    className="text-gray-600 dark:text-gray-400"
                                  >
                                    {expandedSections[`extraction-${idx}`] ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </Button>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                                  {/* Clause Type Distribution */}
                                  {clauses.classifications?.length > 0 && (
                                    <div className="space-y-3">
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Clause Type Distribution
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {(() => {
                                          const typeCounts = clauses.classifications.reduce((acc: any, c: any) => {
                                            const label = c.label || 'General';
                                            acc[label] = (acc[label] || 0) + 1;
                                            return acc;
                                          }, {});
                                          return Object.entries(typeCounts).map(([type, count]: any) => (
                                            <Badge 
                                              key={type}
                                              variant="secondary"
                                              className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1"
                                            >
                                              {type}: {count}
                                            </Badge>
                                          ));
                                        })()}
                                      </div>

                                      {expandedSections[`extraction-${idx}`] && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: 'auto' }}
                                          className="pt-4 border-t border-purple-200 dark:border-purple-800 mt-4"
                                        >
                                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                            All Extracted Clauses
                                          </p>
                                          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                            {d.raw_clauses?.map((clause: string, cidx: number) => (
                                              <div 
                                                key={cidx}
                                                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-900 text-sm"
                                              >
                                                <div className="flex items-start gap-2">
                                                  <Badge variant="outline" className="text-xs shrink-0">
                                                    #{cidx + 1}
                                                  </Badge>
                                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words overflow-wrap-anywhere">
                                                    {clause}
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </motion.div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* SECTION 3: Clause Simplification */}
                              <div className="space-y-4 border-l-4 border-green-500 pl-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Badge className="bg-green-600 text-white px-3 py-1 text-lg font-bold">3</Badge>
                                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                                      <Sparkles className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        Clause Simplification
                                        
                                      </h3>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Legal jargon translated to plain English
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleSection(`simplification-${idx}`)}
                                    className="text-gray-600 dark:text-gray-400"
                                  >
                                    {expandedSections[`simplification-${idx}`] ? (
                                      <ChevronUp className="h-5 w-5" />
                                    ) : (
                                      <ChevronDown className="h-5 w-5" />
                                    )}
                                  </Button>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                                  {summary.key_clauses?.length > 0 ? (
                                    <div className="space-y-4">
                                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Top {Math.min(summary.key_clauses.length, 5)} Simplified Clauses
                                      </p>
                                      <div className="space-y-4">
                                        {summary.key_clauses.slice(0, expandedSections[`simplification-${idx}`] ? undefined : 5).map((c: any) => (
                                          <div 
                                            key={c.id} 
                                            className="bg-white dark:bg-gray-800 rounded-xl p-5 border-2 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow"
                                          >
                                            <div className="flex items-center gap-2 mb-3">
                                              <Badge variant="outline" className="text-xs">
                                                Clause #{c.id}
                                              </Badge>
                                              <Badge className="bg-green-600 text-white text-xs">
                                                {c.type || 'General'}
                                              </Badge>
                                            </div>
                                            
                                            {/* Original Clause */}
                                            <div className="mb-3">
                                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                                Original:
                                              </p>
                                              <p className="text-sm text-gray-600 dark:text-gray-400 italic leading-relaxed break-words overflow-wrap-anywhere">
                                                {c.original || '—'}
                                              </p>
                                            </div>

                                            {/* Simplified Clause */}
                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" />
                                                Simplified:
                                              </p>
                                              <p className="text-base text-gray-900 dark:text-white font-medium leading-relaxed break-words overflow-wrap-anywhere">
                                                {c.simplified || '—'}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      {!expandedSections[`simplification-${idx}`] && summary.key_clauses.length > 5 && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => toggleSection(`simplification-${idx}`)}
                                          className="w-full mt-3"
                                        >
                                          Show {summary.key_clauses.length - 5} More Clauses
                                        </Button>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                                      No simplified clauses available
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Additional Insights */}
                              {(summary.main_parties?.length > 0 || d.legal_terms?.length > 0) && (
                                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Additional Insights
                                  </h4>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    {summary.main_parties?.length > 0 && (
                                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                          Identified Parties
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {summary.main_parties.map((p: any, pidx: number) => (
                                            <Badge 
                                              key={pidx}
                                              variant="secondary"
                                              className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                                            >
                                              {p.text}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {d.legal_terms?.length > 0 && (
                                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-2">
                                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Legal Terms ({d.legal_terms.length})
                                          </p>
                                          {d.legal_terms.length > 10 && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleSection(legalTermsKey)}
                                              className="text-blue-600 dark:text-blue-300 hover:text-blue-50 dark:hover:text-blue-200"
                                            >
                                              {legalTermsExpanded ? 'Show less' : `Show all ${d.legal_terms.length}`}
                                            </Button>
                                          )}
                                        </div>
                                        <div
                                          className={`flex flex-wrap gap-2 ${
                                            legalTermsExpanded
                                              ? 'max-h-48 overflow-y-auto pr-1'
                                              : 'max-h-24 overflow-hidden'
                                          }`}
                                        >
                                          {(legalTermsExpanded ? d.legal_terms : d.legal_terms.slice(0, 10)).map((term: string, tidx: number) => (
                                            <Badge
                                              key={tidx}
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {term}
                                            </Badge>
                                          ))}
                                          {!legalTermsExpanded && d.legal_terms.length > 10 && (
                                            <button
                                              type="button"
                                              onClick={() => toggleSection(legalTermsKey)}
                                              className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-medium"
                                            >
                                              +{d.legal_terms.length - 10} more
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
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