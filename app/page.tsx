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
  Star,
  UserPlus,
  LogOut,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import ThreeBubbles from "@/components/ThreeBubbles"

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
  const { user, logout } = useAuth()

  const handleAuthAction = () => {
    if (user) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative">
      <ThreeBubbles />
      {/* Header */}
      <motion.header
        className="glass-header relative z-10 professional-shadow"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 professional-shadow border border-gray-200 dark:border-gray-700">
              <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">LegalAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/analyze-report"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Analyze Report
            </Link>
            <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              Dashboard
            </Link>
            <Link
              href="/chatbot"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Chatbot
            </Link>
          </nav>
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  Welcome, {user.displayName || user.email}
                </span>
                <Button 
                  variant="outline" 
                  className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                    className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto text-center">
          <motion.div {...fadeInUp}>
            <Badge variant="secondary" className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md text-gray-800 dark:text-gray-200">
              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
              AI-Powered Legal Innovation
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-balance relative z-10 text-gray-900 dark:text-white leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From Complex Legal{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Documents
            </span>{" "}
            to Clear Understanding
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto text-pretty relative z-10"
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
                <Button size="lg" className="text-lg px-8 py-6 overflow-hidden relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 text-white">
                  <motion.span
                    className="flex items-center text-white"
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
                      <ArrowRight className="ml-2 h-5 w-5 text-white" />
                    </motion.div>
                  </motion.span>
                </Button>
              </Link>
            </motion.div>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100">
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
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Powerful AI Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer group shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:shadow-xl hover:shadow-blue-500/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 w-fit mb-4 shadow-md shadow-blue-500/25">
                      <Brain className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="group-hover:text-blue-500 transition-colors text-gray-900 dark:text-white text-xl">Clause Simplification</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Rewrite complex legal clauses into layman-friendly language without losing legal meaning
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/clause-extraction">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 cursor-pointer group shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:shadow-xl hover:shadow-purple-500/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 w-fit mb-4 shadow-md shadow-purple-500/25">
                      <Search className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="group-hover:text-purple-500 transition-colors text-gray-900 dark:text-white text-xl">Clause Extraction</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Detect and segment individual clauses for focused analysis and better understanding
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/document-classification">
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 cursor-pointer group shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:shadow-xl hover:shadow-green-500/10">
                  <CardHeader>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 w-fit mb-4 shadow-md shadow-green-500/25">
                      <FileText className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <CardTitle className="group-hover:text-green-500 transition-colors text-gray-900 dark:text-white text-xl">Document Classification</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Classify uploaded documents into categories like NDA, lease, employment contract
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-300 shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:shadow-xl hover:shadow-orange-500/10 group">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 w-fit mb-4 shadow-md shadow-orange-500/25">
                    <Shield className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white text-xl">Entity Recognition</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Identify and extract key legal entities like parties, dates, and important terms
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-300 shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:shadow-xl hover:shadow-teal-500/10 group">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 w-fit mb-4 shadow-md shadow-teal-500/25">
                    <Upload className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white text-xl">Multiple Formats</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Upload and process various formats including PDF, DOCX, and other document types
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-300 shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:shadow-xl hover:shadow-indigo-500/10 group">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 w-fit mb-4 shadow-md shadow-indigo-500/25">
                    <Download className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <CardTitle className="text-gray-900 dark:text-white text-xl">Export Results</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Simple Three-Step Process</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25 rounded-2xl hover:scale-105 transition-transform duration-300">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. Upload Document</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Simply drag and drop your legal document or browse to select files in PDF, DOCX, or other formats
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/25 rounded-2xl hover:scale-105 transition-transform duration-300">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">2. AI Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Our advanced AI processes your document, extracting clauses and simplifying complex legal language
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/25 rounded-2xl hover:scale-105 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">3. Get Results</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Receive your simplified document with clear explanations and download the results instantly
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Why Choose LegalAI?</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
                Democratize legal information and make complex documents accessible to everyone
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/25">
                    <Clock className="h-6 w-6 text-white flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Save Time & Resources</h3>
                    <p className="text-gray-600 dark:text-gray-300">Reduce manual analysis time from hours to minutes</p>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/25">
                    <Users className="h-6 w-6 text-white flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Accessible to All</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Perfect for small businesses and individuals without legal expertise
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/25 dark:shadow-gray-800/25 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/25">
                    <Shield className="h-6 w-6 text-white flex-shrink-0" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Maintain Legal Accuracy</h3>
                    <p className="text-gray-600 dark:text-gray-300">Simplify without losing essential legal meaning</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-12 px-4 bg-gray-50 dark:bg-gray-900 relative z-10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md shadow-blue-500/25">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">LegalAI</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Making legal documents accessible through AI-powered simplification
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Features</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li>
                  <Link href="/clause-simplification" className="hover:text-blue-500 transition-colors hover:underline">
                    Clause Simplification
                  </Link>
                </li>
                <li>
                  <Link href="/clause-extraction" className="hover:text-purple-500 transition-colors hover:underline">
                    Clause Extraction
                  </Link>
                </li>
                <li>
                  <Link href="/document-classification" className="hover:text-green-500 transition-colors hover:underline">
                    Document Classification
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Company</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
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
