import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';

interface HighlightBoxProps {
  type: 'important' | 'benefit' | 'warning' | 'action';
  text: string;
  index: number;
}

const HighlightBox: React.FC<HighlightBoxProps> = ({ type, text, index }) => {
  const configs = {
    important: {
      icon: Info,
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      title: '💡 Important'
    },
    benefit: {
      icon: CheckCircle,
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      borderColor: 'border-green-200 dark:border-green-800',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
      title: '✅ Benefit'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      title: '⚠️ Warning'
    },
    action: {
      icon: Zap,
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-800 dark:text-purple-200',
      iconColor: 'text-purple-600 dark:text-purple-400',
      title: '🚀 Action Item'
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border-l-4 p-4 my-3 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-300
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 mt-0.5`}>
          <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <div className={`font-semibold text-sm mb-1 ${config.iconColor}`}>
            {config.title}
          </div>
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </motion.div>
  );
};

interface ResponseHighlightsProps {
  highlights: Array<{
    type: 'important' | 'benefit' | 'warning' | 'action';
    text: string;
  }>;
}

export const ResponseHighlights: React.FC<ResponseHighlightsProps> = ({ highlights }) => {
  if (highlights.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      {highlights.map((highlight, index) => (
        <HighlightBox
          key={index}
          type={highlight.type}
          text={highlight.text}
          index={index}
        />
      ))}
    </div>
  );
};

export default HighlightBox;