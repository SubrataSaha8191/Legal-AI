"use client";

import { motion } from "framer-motion";
import { Scale, FileText, Gavel, BookOpen, Shield } from "lucide-react";

interface AnimatedBackgroundProps {
  variant?: "default" | "purple" | "green" | "orange" | "blue";
}

export default function AnimatedBackground({ variant = "default" }: AnimatedBackgroundProps) {
  // Subtle color schemes for professional legal theme
  const colorSchemes = {
    default: {
      gradient: "from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900",
      accent: "text-blue-600/10 dark:text-blue-400/10",
      border: "border-slate-200/30 dark:border-slate-700/30",
    },
    purple: {
      gradient: "from-slate-50 via-purple-50/30 to-slate-100 dark:from-slate-950 dark:via-purple-950/30 dark:to-slate-900",
      accent: "text-purple-600/10 dark:text-purple-400/10",
      border: "border-purple-200/30 dark:border-purple-700/30",
    },
    green: {
      gradient: "from-slate-50 via-emerald-50/30 to-slate-100 dark:from-slate-950 dark:via-emerald-950/30 dark:to-slate-900",
      accent: "text-emerald-600/10 dark:text-emerald-400/10",
      border: "border-emerald-200/30 dark:border-emerald-700/30",
    },
    orange: {
      gradient: "from-slate-50 via-orange-50/30 to-slate-100 dark:from-slate-950 dark:via-orange-950/30 dark:to-slate-900",
      accent: "text-orange-600/10 dark:text-orange-400/10",
      border: "border-orange-200/30 dark:border-orange-700/30",
    },
    blue: {
      gradient: "from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-blue-950/30 dark:to-slate-900",
      accent: "text-blue-600/10 dark:text-blue-400/10",
      border: "border-blue-200/30 dark:border-blue-700/30",
    },
  };

  const colors = colorSchemes[variant];

  // Legal icon components to float
  const legalIcons = [
    { Icon: Scale, delay: 0 },
    { Icon: FileText, delay: 1 },
    { Icon: Gavel, delay: 2 },
    { Icon: BookOpen, delay: 3 },
    { Icon: Shield, delay: 4 },
  ];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Professional Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient}`} />
      
      {/* Geometric Legal-Themed Circles */}
      <motion.div
        className={`absolute top-20 right-20 w-[500px] h-[500px] border-2 ${colors.border} rounded-full`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className={`absolute bottom-20 left-20 w-[600px] h-[600px] border-2 ${colors.border} rounded-full`}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border-2 ${colors.border} rounded-full`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.08, 0.15, 0.08],
          rotate: [0, 180, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Smaller nested circles */}
      <motion.div
        className={`absolute top-1/3 right-1/3 w-[300px] h-[300px] border ${colors.border} rounded-full`}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className={`absolute bottom-1/3 left-1/4 w-[400px] h-[400px] border ${colors.border} rounded-full`}
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Legal Icons */}
      {legalIcons.map(({ Icon, delay }, index) => (
        <motion.div
          key={index}
          className={`absolute ${colors.accent}`}
          style={{
            left: `${15 + index * 18}%`,
            top: `${20 + (index % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.05, 0.15, 0.05],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 8 + index * 2,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut",
          }}
        >
          <Icon size={120} strokeWidth={0.5} />
        </motion.div>
      ))}

      {/* Grid Pattern - More visible */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Tiny Particle Bubbles - Like the original design */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-500/40 dark:bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
      
      {/* Subtle Dots Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Vignette Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.4)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      
      {/* Legal Document Lines Effect - Subtle */}
      <div className="absolute top-0 left-0 right-0 h-full opacity-[0.02]">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="w-full h-[1px] bg-slate-400 dark:bg-slate-600"
            style={{ marginTop: `${i * 40}px` }}
          />
        ))}
      </div>
    </div>
  );
}

