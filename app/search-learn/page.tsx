"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  BookOpen, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Target,
  Award,
  Lightbulb,
  AlertTriangle,
  Shield,
  Zap,
  ArrowRight,
  FileText,
  List,
  ChevronRight
} from "lucide-react";

interface ContentSection {
  heading: string;
  content: string;
  type: "normal" | "important" | "warning" | "benefit" | "action";
}

interface LearningContent {
  title: string;
  introduction: string;
  sections: ContentSection[];
  conclusion: string;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface MockTest {
  questions: Question[];
}

type Phase = 'search' | 'learning' | 'test' | 'results';

export default function SearchLearnPage() {
  const [phase, setPhase] = useState<Phase>('search');
  const [searchTopic, setSearchTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<LearningContent | null>(null);
  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSearch = async () => {
    if (!searchTopic.trim()) return;
    
    setLoading(true);
    try {
      // Generate learning content
      const contentResponse = await fetch('/api/learn-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic, type: 'content' })
      });
      
      if (!contentResponse.ok) throw new Error('Failed to generate content');
      const contentData = await contentResponse.json();
      setContent(contentData);
      setPhase('learning');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startMockTest = async () => {
    setLoading(true);
    try {
      const testResponse = await fetch('/api/learn-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic, type: 'questions' })
      });
      
      if (!testResponse.ok) throw new Error('Failed to generate test');
      const testData = await testResponse.json();
      setMockTest(testData);
      setPhase('test');
      setCurrentQuestion(0);
      setSelectedAnswers(new Array(20).fill(-1));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const toggleMark = (questionIndex: number) => {
    const newMarked = new Set(markedQuestions);
    if (newMarked.has(questionIndex)) {
      newMarked.delete(questionIndex);
    } else {
      newMarked.add(questionIndex);
    }
    setMarkedQuestions(newMarked);
  };

  const submitTest = () => {
    if (!mockTest) return;
    
    let correctCount = 0;
    mockTest.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setTestSubmitted(true);
    setPhase('results');
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'important': return <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'benefit': return <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'action': return <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      default: return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSectionStyle = (type: string) => {
    switch (type) {
      case 'important': 
        return "border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/80 to-transparent dark:from-amber-900/30 dark:to-transparent";
      case 'warning': 
        return "border-l-4 border-red-500 bg-gradient-to-r from-red-50/80 to-transparent dark:from-red-900/30 dark:to-transparent";
      case 'benefit': 
        return "border-l-4 border-green-500 bg-gradient-to-r from-green-50/80 to-transparent dark:from-green-900/30 dark:to-transparent";
      case 'action': 
        return "border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/80 to-transparent dark:from-blue-900/30 dark:to-transparent";
      default: 
        return "border-l-4 border-gray-300 dark:border-gray-600 bg-gradient-to-r from-gray-50/80 to-transparent dark:from-gray-800/30 dark:to-transparent";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Search & Learn
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explore any legal topic with AI-powered comprehensive content and test your knowledge with mock exams
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Search Phase */}
          {phase === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                <CardContent className="p-8">
                  <div className="flex flex-col space-y-6">
                    <div className="text-center">
                      <Search className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                        What would you like to learn?
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Enter any legal topic and get comprehensive AI-generated content
                      </p>
                    </div>
                    
                    <div className="flex flex-col space-y-4">
                      <Input
                        placeholder="e.g., Contract Law, Criminal Procedure, Constitutional Rights..."
                        value={searchTopic}
                        onChange={(e) => setSearchTopic(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="text-lg h-14 border-2 focus:border-blue-500 dark:focus:border-blue-400"
                      />
                      
                      <Button
                        onClick={handleSearch}
                        disabled={loading || !searchTopic.trim()}
                        className="h-14 text-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {loading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="mr-2"
                            >
                              <Brain className="h-5 w-5" />
                            </motion.div>
                            Generating Content...
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2 h-5 w-5" />
                            Start Learning
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Learning Phase */}
          {phase === 'learning' && content && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {content.title}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        <BookOpen className="h-4 w-4 mr-1" />
                        Learning Content
                      </Badge>
                    </div>
                    <Button
                      onClick={startMockTest}
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Take Mock Test
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {/* Introduction */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {content.introduction}
                      </p>
                    </div>
                  </motion.div>

                  {/* Content Sections */}
                  <div className="space-y-6">
                    {content.sections.map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-lg ${getSectionStyle(section.type)}`}
                      >
                        <div className="flex items-start space-x-3">
                          {getSectionIcon(section.type)}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              {section.heading}
                              {section.type !== 'normal' && (
                                <ChevronRight className="h-5 w-5 ml-2 text-gray-400" />
                              )}
                            </h3>
                            <div className="prose prose-gray max-w-none dark:prose-invert">
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Conclusion */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <Award className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                      Conclusion
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {content.conclusion}
                    </p>
                  </motion.div>

                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={startMockTest}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 shadow-lg"
                    >
                      <Target className="mr-2 h-5 w-5" />
                      Ready for Mock Test?
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mock Test Phase */}
          {phase === 'test' && mockTest && (
            <motion.div
              key="test"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Content */}
                <div className="lg:col-span-3">
                  <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                            Mock Test - {searchTopic}
                          </CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-2">
                            <Target className="h-4 w-4 mr-1" />
                            Question {currentQuestion + 1} of {mockTest.questions.length}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-8">
                      {mockTest.questions[currentQuestion] && (
                        <div className="space-y-6">
                          <div className="flex items-start justify-between">
                            <h3 className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed flex-1">
                              {mockTest.questions[currentQuestion].question}
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleMark(currentQuestion)}
                              className={markedQuestions.has(currentQuestion) ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : ''}
                            >
                              {markedQuestions.has(currentQuestion) ? 'Unmark' : 'Mark'}
                            </Button>
                          </div>

                          <div className="space-y-3">
                            {mockTest.questions[currentQuestion].options.map((option, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <label className={`
                                  flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                                  ${selectedAnswers[currentQuestion] === index 
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  }
                                `}>
                                  <input
                                    type="radio"
                                    name={`question-${currentQuestion}`}
                                    checked={selectedAnswers[currentQuestion] === index}
                                    onChange={() => selectAnswer(currentQuestion, index)}
                                    className="mr-3 h-4 w-4 text-blue-600"
                                  />
                                  <span className="text-gray-900 dark:text-white font-medium">
                                    {String.fromCharCode(65 + index)}. {option}
                                  </span>
                                </label>
                              </motion.div>
                            ))}
                          </div>

                          <div className="flex justify-between pt-6">
                            <Button
                              variant="outline"
                              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                              disabled={currentQuestion === 0}
                            >
                              Previous
                            </Button>
                            
                            {currentQuestion === mockTest.questions.length - 1 ? (
                              <Button
                                onClick={submitTest}
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                              >
                                Submit Test
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setCurrentQuestion(Math.min(mockTest.questions.length - 1, currentQuestion + 1))}
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                              >
                                Next
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Question Navigator */}
                <div className="lg:col-span-1">
                  <Card className="shadow-xl border-0 bg-white dark:bg-gray-800 sticky top-4">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <List className="h-5 w-5 mr-2" />
                        Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-2">
                        {mockTest.questions.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentQuestion(index)}
                            className={`
                              h-10 w-10 rounded-lg text-sm font-medium transition-all
                              ${currentQuestion === index 
                                ? 'bg-blue-500 text-white shadow-lg' 
                                : selectedAnswers[index] !== -1
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : markedQuestions.has(index)
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }
                            `}
                          >
                            {index + 1}
                          </button>
                        ))}
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 bg-green-100 dark:bg-green-900 rounded"></div>
                          <span className="text-gray-600 dark:text-gray-400">Answered</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 bg-yellow-100 dark:bg-yellow-900 rounded"></div>
                          <span className="text-gray-600 dark:text-gray-400">Marked</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="h-3 w-3 bg-gray-100 dark:bg-gray-700 rounded"></div>
                          <span className="text-gray-600 dark:text-gray-400">Not Visited</span>
                        </div>
                      </div>

                      <Button
                        onClick={submitTest}
                        className="w-full mt-6 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                      >
                        Submit Test
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Phase */}
          {phase === 'results' && mockTest && testSubmitted && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b">
                  <div className="text-center">
                    <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Test Results
                    </CardTitle>
                    <div className="flex items-center justify-center space-x-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        <Award className="h-4 w-4 mr-1" />
                        Score: {score}/{mockTest.questions.length}
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Percentage: {Math.round((score / mockTest.questions.length) * 100)}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  <div className="mb-8 text-center">
                    <div className={`text-6xl font-bold mb-4 ${
                      score >= mockTest.questions.length * 0.8 ? 'text-green-500' :
                      score >= mockTest.questions.length * 0.6 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {Math.round((score / mockTest.questions.length) * 100)}%
                    </div>
                    <Progress value={(score / mockTest.questions.length) * 100} className="w-64 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {score >= mockTest.questions.length * 0.8 ? 'Excellent performance!' :
                       score >= mockTest.questions.length * 0.6 ? 'Good job! Keep practicing.' : 'More practice needed.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {mockTest.questions.map((question, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 rounded-lg border-l-4 ${
                          selectedAnswers[index] === question.correctAnswer
                            ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20'
                            : 'border-red-500 bg-red-50/50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {selectedAnswers[index] === question.correctAnswer ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500 mt-1" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 mt-1" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Q{index + 1}: {question.question}
                            </h4>
                            
                            <div className="space-y-2 mb-4">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded ${
                                    optIndex === question.correctAnswer
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : selectedAnswers[index] === optIndex
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {optIndex === question.correctAnswer && ' ✓'}
                                  {selectedAnswers[index] === optIndex && optIndex !== question.correctAnswer && ' ✗'}
                                </div>
                              ))}
                            </div>
                            
                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 text-center space-y-4">
                    <Button
                      onClick={() => {
                        setPhase('search');
                        setContent(null);
                        setMockTest(null);
                        setSearchTopic('');
                        setSelectedAnswers([]);
                        setMarkedQuestions(new Set());
                        setTestSubmitted(false);
                        setScore(0);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Search New Topic
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}