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
    const pdfFiles = files.filter(file => file.type === "application/pdf");
    if (pdfFiles.length !== files.length) {
      setUploadStatus("error");
      return;
    }
    setUploadedFiles(prev => [...prev, ...pdfFiles]);
    setUploadStatus("idle");
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);
    setUploadStatus("idle");

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would implement the actual upload logic
      // For now, we'll just simulate success
      setUploadStatus("success");
      setUploadedFiles([]);
    } catch (error) {
      setUploadStatus("error");
    } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Header */}
      <motion.header
        className="glass-header relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">LegalAI</span>
          </div>
          
          <Link 
            href="/"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors"
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
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <Badge variant="secondary" className="mb-6 glass-card bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm text-white border border-white/20">
              <FileText className="h-4 w-4 mr-2" />
              Legal Document Analysis
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Analyze Your Legal Documents
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Upload your PDF documents and let our AI analyze them for insights, compliance, and recommendations.
            </p>
          </motion.div>

          {/* Upload Section */}
          <motion.div variants={fadeInUp}>
            <Card className="glass-card bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Upload className="h-6 w-6 mr-3" />
                  Upload Legal Documents
                </CardTitle>
                <CardDescription className="text-white/60">
                  Drag and drop PDF files or click to browse. Maximum file size: 10MB per file.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                    dragActive
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10"
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
                    accept=".pdf"
                    onChange={handleChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="text-center">
                    <motion.div
                      className="mx-auto mb-4"
                      animate={{ 
                        scale: dragActive ? 1.1 : 1,
                        rotate: dragActive ? 5 : 0 
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 inline-block">
                        <Cloud className="h-12 w-12 text-blue-400" />
                      </div>
                    </motion.div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {dragActive ? "Drop your files here" : "Choose files or drag and drop"}
                    </h3>
                    <p className="text-white/60 mb-4">
                      PDF files only, up to 10MB each
                    </p>
                    
                    <Button 
                      variant="outline" 
                      className="glass-card border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white"
                    >
                      <FileUp className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                  </div>
                </div>

                {/* Status Messages */}
                {uploadStatus === "error" && (
                  <Alert className="mt-4 bg-red-500/10 border-red-500/50 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please upload only PDF files. Some files were not added.
                    </AlertDescription>
                  </Alert>
                )}

                {uploadStatus === "success" && (
                  <Alert className="mt-4 bg-green-500/10 border-green-500/50 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Files uploaded successfully! Analysis will begin shortly.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Uploaded Files</h4>
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded bg-red-500/20">
                              <FileText className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{file.name}</p>
                              <p className="text-white/60 text-sm">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Upload Button */}
                    <div className="mt-6 text-center">
                      <Button
                        onClick={handleUpload}
                        disabled={uploading || uploadedFiles.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 shadow-lg shadow-blue-500/25"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Start Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="mt-8 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-white font-semibold mb-2">What happens next?</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Your documents will be securely processed by our AI</li>
                    <li>• We'll extract key clauses and legal terms</li>
                    <li>• You'll receive a detailed analysis report</li>
                    <li>• All uploads are encrypted and automatically deleted after processing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}