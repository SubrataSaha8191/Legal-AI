import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { Components } from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Components = {
    // Headings
    h1: ({ children, ...props }) => (
      <h1 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 className="text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-white" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 className="text-lg font-semibold mb-2 mt-4 text-gray-800 dark:text-gray-100" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 className="text-base font-semibold mb-2 mt-3 text-gray-800 dark:text-gray-100" {...props}>
        {children}
      </h4>
    ),
    
    // Paragraphs
    p: ({ children, ...props }) => (
      <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-outside ml-6 mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-outside ml-6 mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1 leading-relaxed" {...props}>
        {children}
      </li>
    ),
    
    // Emphasis
    strong: ({ children, ...props }) => (
      <strong className="font-bold text-gray-900 dark:text-white" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }) => (
      <em className="italic text-gray-800 dark:text-gray-200" {...props}>
        {children}
      </em>
    ),
    
    // Code
    code: ({ children, className, ...props }) => {
      const isInline = !className;
      return isInline ? (
        <code className="bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      ) : (
        <code className={`block bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm my-3 ${className || ''}`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg overflow-x-auto my-3" {...props}>
        {children}
      </pre>
    ),
    
    // Blockquotes
    blockquote: ({ children, ...props }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 italic text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/10 rounded-r" {...props}>
        {children}
      </blockquote>
    ),
    
    // Tables
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-gray-100 dark:bg-gray-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </td>
    ),
    
    // Links
    a: ({ children, ...props }) => (
      <a className="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    ),
    
    // Horizontal Rule
    hr: (props) => (
      <hr className="my-6 border-gray-300 dark:border-gray-600" {...props} />
    ),
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
