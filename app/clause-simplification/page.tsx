"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, FileText, Lightbulb, CheckCircle, Scale } from "lucide-react"
import Link from "next/link"
import AnimatedBackground from "@/components/AnimatedBackground"

export default function ClauseSimplificationPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Unique Green Background */}
      <AnimatedBackground variant="green" />

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
              <Link href="/clause-extraction" className="text-white/80 hover:text-white transition-colors font-medium">
                Extraction
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/10 to-orange-600/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">AI-Powered Simplification</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                Clause Simplification
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-8 text-pretty max-w-2xl mx-auto leading-relaxed">
              Transform complex legal clauses into clear, understandable language without losing legal meaning or
              accuracy.
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
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                  <FileText className="w-8 h-8 text-orange-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-white text-xl">Complex to Simple</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">
                  Convert intricate legal jargon into plain English that anyone can understand
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-white text-xl">Legal Accuracy</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">
                  Maintain complete legal meaning and enforceability while improving readability
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/10 group">
              <CardHeader>
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                  <Lightbulb className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-white text-xl">Context Aware</CardTitle>
                <CardDescription className="text-white/70 leading-relaxed">
                  AI understands legal context to provide accurate and relevant simplifications
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.section>

        {/* How It Works */}
        <motion.section
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">How It Works</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed">
              Our AI analyzes complex legal language and rewrites it in simple terms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Upload Document</h3>
              <p className="text-white/70">Upload your legal document or paste the clause text</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">AI Analysis</h3>
              <p className="text-white/70">Our AI analyzes the legal language and context</p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl hover:scale-105 transition-transform duration-300">
                <span className="text-2xl font-bold text-green-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Get Simplified Text</h3>
              <p className="text-white/70">Receive clear, understandable language that retains legal meaning</p>
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
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl max-w-2xl mx-auto hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20">
            <CardContent className="p-12">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-sm border border-white/10 w-fit">
                <Lightbulb className="h-8 w-8 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">Ready to Simplify?</span>
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">Start making legal documents accessible to everyone</p>
              <motion.div whileHover="hover" className="inline-block">
                <Button size="lg" className="group bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/25">
                  <motion.span
                    variants={{
                      hover: { x: -8 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    Try Clause Simplification
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
