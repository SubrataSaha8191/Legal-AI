"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Search, Target, Layers, Scale } from "lucide-react"
import Link from "next/link"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function ClauseExtractionPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Unique Purple Background */}
      <AnimatedBackground variant="purple" />

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
              <Link
                href="/document-classification"
                className="text-white/80 hover:text-white transition-colors font-medium"
              >
                Classification
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Search className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Intelligent Extraction</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              <span className="text-white">Clause Extraction &</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                Breakdown
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
              Automatically detect and segment individual clauses from complex legal documents for focused analysis and
              review.
            </p>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                  <Target className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-white text-xl">Precise Detection</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">
                  Accurately identify and isolate individual clauses within complex legal documents
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                  <Layers className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-white text-xl">Smart Segmentation</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">
                  Break down documents into logical sections for easier review and analysis
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                  <Search className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-white text-xl">Focused Analysis</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">
                  Enable detailed examination of specific clauses without document complexity
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.section>

        {/* Process Steps */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">Extraction Process</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              Advanced AI algorithms identify and extract clauses with precision
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Document Upload</h3>
              <p className="text-sm text-white/70">Upload your legal document</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">AI Scanning</h3>
              <p className="text-sm text-white/70">AI scans for clause patterns</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Clause Detection</h3>
              <p className="text-sm text-white/70">Individual clauses identified</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-orange-400">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Structured Output</h3>
              <p className="text-sm text-white/70">Organized clause breakdown</p>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl max-w-2xl mx-auto hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
            <CardContent className="p-12">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 w-fit">
                <Search className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">Start Extracting</span>
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">Break down complex documents into manageable clauses</p>
              <motion.div whileHover="hover" className="inline-block">
                <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                  <motion.span
                    variants={{
                      hover: { x: -8 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    Try Clause Extraction
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
