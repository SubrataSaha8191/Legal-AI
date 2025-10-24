"use client"

import { useCallback, useState } from "react"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onFileSelect: (fileUrl: string) => void
  disabled?: boolean
  accept?: string
}

export function FileUpload({ onFileSelect, disabled = false, accept = ".pdf" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async (file: File) => {
      if (disabled) return

      setError(null)
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.error || "Upload failed")

  setFileName(file.name)
  // Pass relative URL so server can read from disk directly
  onFileSelect(data.fileUrl)
      } catch (e: any) {
        setError(e?.message ?? "Upload failed")
        setFileName(null)
      } finally {
        setUploading(false)
      }
    },
    [onFileSelect, disabled]
  )

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled || uploading) return

      const file = e.dataTransfer.files[0]
      if (file) uploadFile(file)
    },
    [uploadFile, disabled, uploading]
  )

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
    },
    [uploadFile]
  )

  const clearFile = useCallback(() => {
    setFileName(null)
    setError(null)
  }, [])

  return (
    <div className="w-full">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-colors",
          isDragging ? "border-accent bg-accent/10" : "border-border bg-background/50",
          disabled || uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-accent/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={onFileChange}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload-input"
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {uploading ? (
            <>
              <Upload className="w-12 h-12 text-accent animate-pulse" />
              <p className="text-sm font-medium">Uploading...</p>
            </>
          ) : fileName ? (
            <>
              <FileText className="w-12 h-12 text-accent" />
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{fileName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearFile()
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium mb-1">Drop your PDF here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports PDF files</p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}
