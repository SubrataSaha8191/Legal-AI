"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowLeft, BarChart3, Users, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
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
        <motion.div className="max-w-4xl mx-auto text-center" {...fadeInUp}>
          <Badge variant="secondary" className="mb-6 glass-card bg-gradient-to-r from-blue-500/10 to-purple-600/10 backdrop-blur-sm text-white border border-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics Dashboard
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Dashboard
          </h1>
          
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Your legal document analytics and insights dashboard is coming soon.
          </p>

          <Card className="glass-card bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Coming Soon</CardTitle>
              <CardDescription className="text-white/60">
                We're working hard to bring you comprehensive analytics and insights.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Document Analysis</h3>
                  <p className="text-white/60 text-sm">Track your analyzed documents</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Usage Statistics</h3>
                  <p className="text-white/60 text-sm">Monitor your usage patterns</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10">
                  <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <h3 className="text-white font-semibold">Team Management</h3>
                  <p className="text-white/60 text-sm">Manage team access and roles</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}