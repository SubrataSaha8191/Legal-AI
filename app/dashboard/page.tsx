"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scale, 
  ArrowLeft, 
  BarChart3, 
  Users, 
  FileText, 
  TrendingUp, 
  Brain,
  Shield,
  Clock,
  PieChart,
  Activity,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Star,
  Zap
} from "lucide-react";
import Link from "next/link";

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

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Professional Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
                <Scale className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">LegalAI</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Professional Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
              <Link 
                href="/"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Your Dashboard
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Manage your legal document analysis and insights
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 shadow-lg">
                <Star className="h-4 w-4 mr-2" />
                Professional Plan
              </Badge>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Documents</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">247</p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12% this month
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Processing Time</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">2.3m</p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <Zap className="h-3 w-3 mr-1" />
                      45% faster
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                    <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Accuracy Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">98.7%</p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Industry leading
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cost Savings</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">$24.5K</p>
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      vs manual review
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20">
                    <PieChart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Dashboard Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">Latest document analysis results</CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { name: "Employment_Contract_2024.pdf", status: "Completed", time: "2 hours ago", type: "Contract" },
                        { name: "NDA_Partnership_Agreement.pdf", status: "Processing", time: "4 hours ago", type: "NDA" },
                        { name: "Lease_Agreement_Commercial.pdf", status: "Completed", time: "1 day ago", type: "Lease" },
                        { name: "Privacy_Policy_Update.pdf", status: "Completed", time: "2 days ago", type: "Policy" },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{item.type} • {item.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={item.status === "Completed" ? "default" : "secondary"}
                              className={item.status === "Completed" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : ""}
                            >
                              {item.status}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">Start your next analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Link href="/clause-simplification">
                        <div className="p-6 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group">
                          <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Clause Simplification</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Simplify complex legal language</p>
                        </div>
                      </Link>
                      
                      <Link href="/document-classification">
                        <div className="p-6 rounded-xl border-2 border-dashed border-green-300 dark:border-green-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all cursor-pointer group">
                          <FileText className="h-8 w-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Document Classification</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Classify document types</p>
                        </div>
                      </Link>

                      <Link href="/search-learn">
                        <div className="p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all cursor-pointer group">
                          <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Search & Learn</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered learning with mock tests</p>
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Usage Overview */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Monthly Usage</h3>
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Documents Processed</span>
                          <span>247/500</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full w-[49%]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>API Calls</span>
                          <span>1.2K/5K</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div className="bg-white h-2 rounded-full w-[24%]"></div>
                        </div>
                      </div>
                    </div>
                    <Button variant="secondary" className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0">
                      Upgrade Plan
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Team Management */}
              <motion.div variants={fadeInUp}>
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Team Members
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "John Doe", role: "Admin", status: "active" },
                        { name: "Jane Smith", role: "Analyst", status: "active" },
                        { name: "Mike Johnson", role: "Reviewer", status: "inactive" },
                      ].map((member, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{member.role}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}