"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Scale, Menu, X, UserPlus, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/analyze-report", label: "Analyze" },
  { href: "/chatbot", label: "Chatbot" },
  { href: "/search-learn", label: "Search & Learn" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-800"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Scale className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                LegalAI
              </span>
            </Link>

            {/* Desktop Navigation - Centered absolutely */}
            <nav className="hidden lg:block absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center space-x-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full px-2 py-1 border border-gray-200 dark:border-gray-700 shadow-sm">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "text-white"
                          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pathname === link.href && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full -z-10"
                          layoutId="activeNav"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      {link.label}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user.displayName || user.email?.split("@")[0]}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-gray-700 dark:text-gray-300">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button
                      variant="outline"
                      className="rounded-full border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed top-16 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 space-y-6">
                {/* Mobile Navigation Links */}
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                      <motion.div
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                          pathname === link.href
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="font-medium">{link.label}</span>
                      </motion.div>
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  {user ? (
                    <>
                      <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.email}
                        </p>
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-in" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
