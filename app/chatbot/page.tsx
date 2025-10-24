"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { 
  Scale, 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  FileText,
  Brain,
  Shield,
  Clock,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreVertical
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion';
  time: string; // preformatted, deterministic time string to avoid SSR/CSR mismatch
}

const quickSuggestions = [
  "What is a non-disclosure agreement?",
  "Explain employment contract terms",
  "How to review a lease agreement?",
  "What are the key elements of a contract?",
  "Explain intellectual property rights",
  "What is force majeure in contracts?"
];

export default function ChatbotPage() {
  // Deterministic, locale-independent time formatter to prevent hydration mismatch
  const formatTime = (d: Date) => {
    const h = d.getHours();
    const hour12 = ((h + 11) % 12) + 1; // 0 -> 12, 13 -> 1, etc.
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${hour12.toString().padStart(2,'0')}:${m} ${ampm}`; // Always uppercase & zero-padded
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `## Hello! I'm your Legal AI Assistant 👋

I can help you understand legal documents, explain legal terms, and provide guidance on various legal matters.

### What I can help with:
- **Contract Analysis** - Review and explain contract terms
- **Legal Document Classification** - Identify document types
- **Clause Extraction** - Find key clauses in agreements
- **Legal Terminology** - Explain complex legal terms
- **Document Comparison** - Compare different legal documents

### How to get started:
1. Ask me a question about legal documents or terms
2. Upload a document for analysis (use the "Analyze Report" feature)
3. Try one of the quick suggestions below

> **Disclaimer**: This AI assistant provides general information only and should not be considered legal advice. Always consult with a qualified attorney for specific legal matters.`,
      sender: 'bot',
      timestamp: new Date(),
      time: formatTime(new Date())
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [likedMessages, setLikedMessages] = useState<Set<string>>(new Set());
  const [dislikedMessages, setDislikedMessages] = useState<Set<string>>(new Set());
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle copying message content to clipboard
  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  // Handle liking a message
  const handleLikeMessage = (messageId: string) => {
    setLikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        // Remove from disliked if it was disliked
        setDislikedMessages(prevDisliked => {
          const newDislikedSet = new Set(prevDisliked);
          newDislikedSet.delete(messageId);
          return newDislikedSet;
        });
      }
      return newSet;
    });
  };

  // Handle disliking a message
  const handleDislikeMessage = (messageId: string) => {
    setDislikedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
        // Remove from liked if it was liked
        setLikedMessages(prevLiked => {
          const newLikedSet = new Set(prevLiked);
          newLikedSet.delete(messageId);
          return newLikedSet;
        });
      }
      return newSet;
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      time: formatTime(new Date())
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call the real Gemini API instead of mock response
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });
      let data: any = null;
      try {
        data = await response.json();
      } catch (e) {
        // ignore JSON parse errors
      }

      if (!response.ok) {
        const serverMsg = data?.details || data?.error || `API error: ${response.status}`;
        console.error('[Chatbot] Server error body:', data);
        toast.error('AI service error', { description: String(serverMsg) });
        throw new Error(String(serverMsg));
      }

      const dataResponse = data || {};
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: dataResponse.response || "I apologize, but I couldn't process your request at the moment.",
        sender: 'bot',
        timestamp: new Date(),
        time: formatTime(new Date())
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        toast.error('AI request failed', { description: errMsg });

        // Fallback response on API failure
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I'm sorry, I'm experiencing technical difficulties: ${errMsg}`,
          sender: 'bot',
          timestamp: new Date(),
          time: formatTime(new Date())
        };

        setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // This function is now unused since we're using the real API
  // Keeping it commented for reference in case we need fallback logic
  /*
  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('nda') || lowerInput.includes('non-disclosure')) {
      return "A Non-Disclosure Agreement (NDA) is a legal contract that establishes confidentiality between parties. It prevents the sharing of confidential information and typically includes: 1) Definition of confidential information, 2) Obligations of the receiving party, 3) Duration of confidentiality, 4) Exceptions to confidentiality, and 5) Consequences of breach. NDAs are commonly used in business partnerships, employment relationships, and when sharing sensitive business information.";
    }
    
    if (lowerInput.includes('contract') || lowerInput.includes('agreement')) {
      return "A contract is a legally binding agreement between parties that contains essential elements: 1) Offer and acceptance, 2) Consideration (exchange of value), 3) Legal capacity of parties, 4) Legal purpose, and 5) Mutual assent. Key contract terms typically include scope of work, payment terms, duration, termination clauses, and dispute resolution mechanisms. Always ensure contracts are clear, specific, and reviewed by legal counsel when dealing with significant transactions.";
    }
    
    if (lowerInput.includes('employment') || lowerInput.includes('job')) {
      return "Employment contracts typically include: 1) Job description and responsibilities, 2) Compensation and benefits, 3) Work schedule and location, 4) Confidentiality and non-compete clauses, 5) Termination procedures, 6) Intellectual property ownership, and 7) Dispute resolution. Important considerations include at-will employment status, severance terms, and compliance with labor laws. Review these carefully before signing.";
    }
    
    if (lowerInput.includes('lease') || lowerInput.includes('rent')) {
      return "Lease agreements should include: 1) Property description and permitted use, 2) Lease term and renewal options, 3) Rent amount and payment schedule, 4) Security deposit terms, 5) Maintenance responsibilities, 6) Restrictions and rules, 7) Termination conditions, and 8) Default remedies. Pay attention to escalation clauses, subletting rights, and early termination penalties.";
    }
    
    return "Thank you for your question about legal matters. Based on your query, I recommend: 1) Consulting relevant legal documentation, 2) Reviewing applicable laws and regulations, 3) Considering the specific context of your situation, and 4) Seeking professional legal advice for complex matters. Legal issues often require careful analysis of specific facts and circumstances. Would you like me to elaborate on any particular aspect?";
  };
  */

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Fixed Header */}
      <motion.header
        className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-lg flex-shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/25">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 bg-clip-text text-transparent">LegalAI</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">Legal Assistant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
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

      {/* Scrollable Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 relative z-10 overflow-y-auto custom-scrollbar"
      >
        <div className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          <div className="space-y-6">
            <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600' 
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                      
                      <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-2xl px-6 py-4 shadow-lg max-w-full ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
                        }`}>
                          {message.sender === 'bot' ? (
                            <MarkdownRenderer content={message.content} />
                          ) : (
                            <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        
                        <div className={`flex items-center mt-2 space-x-2 ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {message.time}
                          </span>
                          {message.sender === 'bot' && (
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-1 h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-600"
                                onClick={() => handleCopyMessage(message.id, message.content)}
                                title={copiedMessageId === message.id ? "Copied!" : "Copy message"}
                              >
                                <Copy className={`h-3 w-3 ${copiedMessageId === message.id ? 'text-green-600' : ''}`} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`p-1 h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                  likedMessages.has(message.id) ? 'text-green-600' : ''
                                }`}
                                onClick={() => handleLikeMessage(message.id)}
                                title="Like this response"
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`p-1 h-6 w-6 hover:bg-gray-100 dark:hover:bg-gray-600 ${
                                  dislikedMessages.has(message.id) ? 'text-red-600' : ''
                                }`}
                                onClick={() => handleDislikeMessage(message.id)}
                                title="Dislike this response"
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-6 py-4 shadow-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Quick Suggestions (moved into the scrollable area so they scroll with messages) */}
              {messages.length === 1 && (
                <motion.div 
                  className="mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Quick questions to get started:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="text-xs bg-white dark:bg-gray-800 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section - Input & Footer */}
        <div className="relative z-10 flex-shrink-0 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-900 dark:via-gray-900 dark:to-transparent">
          <div className="container mx-auto px-4 pb-6 max-w-4xl">
            {/* Quick Suggestions moved to the scrollable messages area */}

            {/* Fixed Input Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-xl">
                <CardContent className="p-4">
              <div className="flex items-end space-x-4">
                <div className="flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(inputValue);
                      }
                    }}
                    placeholder="Ask me anything about legal documents, contracts, or legal terms..."
                    className="resize-none border-0 shadow-none focus-visible:ring-0 text-base bg-transparent"
                    disabled={isTyping}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3" />
                    <span>AI-powered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Real-time</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Press Enter to send
                </p>
              </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fixed Disclaimer Footer */}
          <motion.p 
            className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            This AI assistant provides general information only and should not be considered legal advice. 
            Always consult with a qualified attorney for specific legal matters.
          </motion.p>
        </div>
      </div>
    </div>
  );
}