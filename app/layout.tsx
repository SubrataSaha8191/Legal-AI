import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "sonner"
import ConditionalScrollProgress from "@/components/ConditionalScrollProgress"
import "./globals.css"

export const metadata: Metadata = {
  title: "LegalAI - AI-Powered Legal Document Simplifier",
  description:
    "Transform complex legal documents into clear, understandable language with our AI-powered analyzer. Perfect for law firms, small businesses, and individuals.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </AuthProvider>
  <Toaster position="top-right" richColors />
  <ConditionalScrollProgress />
        <Analytics />
      </body>
    </html>
  )
}
