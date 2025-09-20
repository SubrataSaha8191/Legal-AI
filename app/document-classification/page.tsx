"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileType, Shield, Briefcase, Home, Scale } from "lucide-react"
import Link from "next/link"

export default function DocumentClassificationPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced gradient blobs */}
      <div className="gradient-blob-1"></div>
      <div className="gradient-blob-2"></div>
      <div className="gradient-blob-3"></div>

      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10">
                <Scale className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">LegalAI</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/clause-simplification"
                className="text-white/80 hover:text-white transition-colors font-medium"
              >
                Simplification
              </Link>
              <Link href="/clause-extraction" className="text-white/80 hover:text-white transition-colors font-medium">
                Extraction
              </Link>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">Get Started</Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.section
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-teal-600/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FileType className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-white">Smart Classification</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              <span className="text-white">Document</span>{" "}
              <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">
                Classification
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
              Automatically classify uploaded documents into categories like NDA, lease agreements, employment
              contracts, and more.
            </p>
          </div>
        </motion.section>

        {/* Document Types */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">Supported Document Types</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              Our AI recognizes and classifies various legal document types
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-600/20 backdrop-blur-sm border border-white/10 w-fit mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-lg text-white">NDAs</CardTitle>
                <CardDescription className="text-white/70">Non-disclosure agreements and confidentiality contracts</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-white/10 w-fit mx-auto mb-4">
                  <Home className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-lg text-white">Lease Agreements</CardTitle>
                <CardDescription className="text-white/70">Rental and property lease contracts</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-600/20 backdrop-blur-sm border border-white/10 w-fit mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-lg text-white">Employment</CardTitle>
                <CardDescription className="text-white/70">Job contracts and employment agreements</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 w-fit mx-auto mb-4">
                  <FileType className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-lg text-white">Service Agreements</CardTitle>
                <CardDescription className="text-white/70">Professional service and consulting contracts</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">Instant Recognition</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">Upload any legal document and get instant classification results</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">High Accuracy</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">Advanced AI models trained on thousands of legal documents</CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
              <CardHeader>
                <CardTitle className="text-white text-xl">Multiple Formats</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">Support for PDF, DOCX, and other common document formats</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">Classification Process</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              Simple three-step process to classify your legal documents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Upload Document</h3>
              <p className="text-white/70">Upload your legal document in PDF or DOCX format</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Analysis</h3>
              <p className="text-white/70">Our AI analyzes content and structure patterns</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Get Classification</h3>
              <p className="text-white/70">Receive accurate document type classification</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl max-w-2xl mx-auto hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
            <CardContent className="p-12">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-teal-600/20 backdrop-blur-sm border border-white/10 w-fit">
                <FileType className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 bg-clip-text text-transparent">Classify Your Documents</span>
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">Organize and understand your legal documents instantly</p>
              <motion.div whileHover="hover" className="inline-block">
                <Button size="lg" className="group bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg shadow-green-500/25">
                  <motion.span
                    variants={{
                      hover: { x: -8 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    Try Document Classification
                  </motion.span>
                  <motion.div
                    variants={{
                      hover: { x: 4, scaleX: 1.6, scale: 1.2 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </motion.div>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  )
}
