"use client"

import React, { useState } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { Combine, ArrowRight, Download, Loader2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'

export default function MergePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { isProcessing, progress, resultUrl, processFiles, reset } = useFileProcessing()

  const handleMerge = () => {
    if (selectedFiles.length < 2) return
    processFiles('/pdf/merge', selectedFiles)
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-cyan-500/20">
          <Combine size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Merge PDF</h1>
          <p className="text-gray-500 text-sm">Combine two or more PDF files into a single document.</p>
        </div>
      </div>

      <div className="space-y-8">
        {!resultUrl ? (
          <>
            <FileDropzone
              onFilesSelected={setSelectedFiles}
              maxFiles={20}
            />

            <div className="flex justify-center">
              <button
                disabled={selectedFiles.length < 2 || isProcessing}
                onClick={handleMerge}
                className="btn-primary flex items-center gap-2 px-12 py-4 text-lg disabled:opacity-50 disabled:scale-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Merge Files
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center"
          >
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Download size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Done! Your file is ready.</h2>
            <p className="text-gray-500 mb-8">Your merged PDF is available for download and will be deleted in 24 hours.</p>

            <div className="flex justify-center gap-4">
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                Download Now
                <Download size={20} />
              </a>
              <button
                onClick={() => {
                  setSelectedFiles([])
                  reset()
                }}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RotateCcw size={20} />
                Start Over
              </button>
            </div>
          </motion.div>
        )}

        {isProcessing && <ProgressBar progress={progress} />}
      </div>
    </div>
  )
}
