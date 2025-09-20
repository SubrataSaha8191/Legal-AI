"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Brain,
  Shield,
  Zap,
  CheckCircle,
  Users,
  Clock,
  Scale,
  ArrowRight,
  Upload,
  Search,
  Download,
  Menu,
  X,
  Star,
  Award,
  TrendingUp,
  UserPlus,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LegalAILanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleAuthAction = () => {
    if (user) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-background">
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
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/analyze-report"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              Analyze Report
            </Link>
            <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <Link
              href="/chatbot"
              className="text-white/80 hover:text-white transition-colors font-medium"
            >
              Chatbot
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-white/80 text-sm">
                  Welcome, {user.displayName || user.email}
                </span>
                <Button 
                  variant="outline" 
                  className="glass-card border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white"
                  onClick={handleAuthAction}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button 
                    variant="outline" 
                    className="glass-card border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="glass-card border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp}>
            <Badge variant="secondary" className="mb-6 glass-card bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm text-white border border-white/20">
              <Zap className="h-4 w-4 mr-2" />
              AI-Powered Legal Innovation
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-balance relative z-10 text-white leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From Complex Legal{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Documents
            </span>{" "}
            to Clear Understanding
          </motion.h1>

          <motion.p
            className="text-xl text-white/80 mb-8 max-w-3xl mx-auto text-pretty relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Transform dense legal clauses into plain English with our AI-powered document analyzer. Democratize legal
            information for small businesses and individuals.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-8 py-6 overflow-hidden relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25">
                  <motion.span
                    className="flex items-center"
                    whileHover={{ x: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    Get Started
                    <motion.div
                      whileHover={{
                        scale: 1.4,
                        x: 8,
                        scaleX: 1.6,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 glass-card border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white">
              Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Powerful AI Features</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Our advanced AI technology makes legal documents accessible to everyone
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <Link href="/clause-simplification">
                <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-blue-500/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                      <Brain className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="group-hover:text-blue-400 transition-colors text-white text-xl">Clause Simplification</CardTitle>
                    <CardDescription className="text-white/70 leading-relaxed">
                      Rewrite complex legal clauses into layman-friendly language without losing legal meaning
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/clause-extraction">
                <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-purple-500/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                      <Search className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="group-hover:text-purple-400 transition-colors text-white text-xl">Clause Extraction</CardTitle>
                    <CardDescription className="text-white/70 leading-relaxed">
                      Detect and segment individual clauses for focused analysis and better understanding
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/document-classification">
                <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:shadow-2xl hover:shadow-green-500/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                      <FileText className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="group-hover:text-green-400 transition-colors text-white text-xl">Document Classification</CardTitle>
                    <CardDescription className="text-white/70 leading-relaxed">
                      Classify uploaded documents into categories like NDA, lease, employment contract
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 group">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                    <Shield className="h-8 w-8 text-orange-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-white text-xl">Entity Recognition</CardTitle>
                  <CardDescription className="text-white/70 leading-relaxed">
                    Identify and extract key legal entities like parties, dates, and important terms
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 group">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                    <Upload className="h-8 w-8 text-teal-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-white text-xl">Multiple Formats</CardTitle>
                  <CardDescription className="text-white/70 leading-relaxed">
                    Upload and process various formats including PDF, DOCX, and other document types
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-full hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 group">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 backdrop-blur-sm border border-white/10 w-fit mb-4">
                    <Download className="h-8 w-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-white text-xl">Export Results</CardTitle>
                  <CardDescription className="text-white/70 leading-relaxed">
                    Download simplified documents and analysis reports in your preferred format
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-600/5 backdrop-blur-sm"></div>
        <div className="container mx-auto relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4 text-white">Simple Three-Step Process</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Transform your legal documents in minutes, not hours
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="glass-card w-20 h-20 flex items-center justify-center mx-auto mb-6 border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-xl rounded-2xl hover:scale-105 transition-transform duration-300">
                <Upload className="h-10 w-10 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">1. Upload Document</h3>
              <p className="text-white/70 leading-relaxed">
                Simply drag and drop your legal document or browse to select files in PDF, DOCX, or other formats
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="glass-card w-20 h-20 flex items-center justify-center mx-auto mb-6 border-white/10 bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-2xl hover:scale-105 transition-transform duration-300">
                <Brain className="h-10 w-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">2. AI Analysis</h3>
              <p className="text-white/70 leading-relaxed">
                Our advanced AI processes your document, extracting clauses and simplifying complex legal language
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="glass-card w-20 h-20 flex items-center justify-center mx-auto mb-6 border-white/10 bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-2xl hover:scale-105 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">3. Get Results</h3>
              <p className="text-white/70 leading-relaxed">
                Receive your simplified document with clear explanations and download the results instantly
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">Why Choose LegalAI?</h2>
              <p className="text-xl text-white/70 mb-8">
                Democratize legal information and make complex documents accessible to everyone
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-white/10">
                    <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Save Time & Resources</h3>
                    <p className="text-white/70">Reduce manual analysis time from hours to minutes</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10">
                    <Users className="h-5 w-5 text-purple-400 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Accessible to All</h3>
                    <p className="text-white/70">
                      Perfect for small businesses and individuals without legal expertise
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-white/10">
                    <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white">Maintain Legal Accuracy</h3>
                    <p className="text-white/70">Simplify without losing essential legal meaning</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10 w-fit">
                    <Star className="h-8 w-8 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl text-white">Ready to Get Started?</CardTitle>
                  <CardDescription className="text-lg text-white/70">
                    Join thousands of users who trust LegalAI for document analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm border border-white/10">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">Free Trial</div>
                    <p className="text-white/70">No credit card required</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="group">
                    <Button size="lg" className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 overflow-hidden relative">
                      <motion.span
                        className="flex items-center"
                        whileHover={{ x: -8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        Start Free Trial
                        <motion.div
                          whileHover={{
                            scale: 1.4,
                            x: 8,
                            scaleX: 1.6,
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </motion.div>
                      </motion.span>
                    </Button>
                  </motion.div>
                  <p className="text-sm text-white/60 text-center">
                    Process up to 5 documents free. Upgrade anytime.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 backdrop-blur-xl bg-white/5 relative z-10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border border-white/10">
                  <Scale className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">LegalAI</span>
              </div>
              <p className="text-white/70 leading-relaxed">
                Making legal documents accessible through AI-powered simplification
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Features</h3>
              <ul className="space-y-3 text-white/70">
                <li>
                  <Link href="/clause-simplification" className="hover:text-white transition-colors hover:underline">
                    Clause Simplification
                  </Link>
                </li>
                <li>
                  <Link href="/clause-extraction" className="hover:text-white transition-colors hover:underline">
                    Clause Extraction
                  </Link>
                </li>
                <li>
                  <Link href="/document-classification" className="hover:text-white transition-colors hover:underline">
                    Document Classification
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3 text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:underline">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:underline">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:underline">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-3 text-white/70">
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:underline">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:underline">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors hover:underline">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2024 LegalAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
