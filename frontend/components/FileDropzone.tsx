"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FileDropzoneProps {
  onFilesSelected: (files: File[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
}

const FileDropzone = ({ onFilesSelected, accept = { 'application/pdf': ['.pdf'] }, maxFiles = 10 }: FileDropzoneProps) => {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const updatedFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }, [files, maxFiles, onFilesSelected])

  const removeFile = (name: string) => {
    const updatedFiles = files.filter(f => f.name !== name)
    setFiles(updatedFiles)
    onFilesSelected(updatedFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles
  })

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer group",
          isDragActive
            ? "border-cyan-500 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
            : "border-gray-800 hover:border-gray-700 hover:bg-gray-800/30"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className={cn(
            "p-5 rounded-2xl mb-4 transition-all duration-300",
            isDragActive ? "bg-cyan-500 text-white scale-110" : "bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-cyan-400"
          )}>
            <Upload size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-200 mb-2">
            {isDragActive ? "Drop files here" : "Choose files or drag & drop"}
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            Documents up to 100MB each. Your files are processed securely and deleted automatically.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-2xl p-4 divide-y divide-gray-800 overflow-hidden"
          >
            {files.map((file) => (
              <div key={file.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-800 rounded-lg text-cyan-400">
                    <File size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200 max-w-[200px] truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.name)}
                  className="p-2 hover:bg-red-500/10 hover:text-red-500 text-gray-500 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {files.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl text-purple-400/80 text-sm">
          <Info size={20} className="shrink-0" />
          <p>You can upload up to {maxFiles} files for processing at once. Multiple select is supported.</p>
        </div>
      )}
    </div>
  )
}

export default FileDropzone
