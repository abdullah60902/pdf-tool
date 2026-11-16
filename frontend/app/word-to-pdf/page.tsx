"use client"

import React, { useState } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { FileDigit, ArrowRight, Download, Loader2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'

export default function WordToPdfPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { isProcessing, progress, resultUrl, processFiles, reset, statusMessage } = useFileProcessing()

  const handleConvert = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    processFiles('/pdf/word-to-pdf', selectedFiles, {}, undefined, { responseType: 'blob' });
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/20">
          <FileDigit size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Word to PDF</h1>
          <p className="text-gray-500 text-sm">Create professional PDF files from Word documents.</p>
        </div>
      </div>

      <div className="space-y-8">
        {!resultUrl ? (
          <>
            <FileDropzone
              onFilesSelected={setSelectedFiles}
              accept={{
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/msword': ['.doc']
              }}
              maxFiles={10}
            />

            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleConvert(e as any);
            }}>
              <div className="glass rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-100">Features</h3>
                <div className="space-y-3 text-sm text-gray-400">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                    <p>Convert DOCX files to PDF format</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                    <p>Professional PDF output</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                    <p>Secure cloud processing</p>
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mt-4">
                  <p className="text-sm text-indigo-200">
                    <strong>Enterprise Engine:</strong> High-performance conversion powered by LibreOffice.
                    Full formatting, images, and layout preservation enabled. 100% secure processing.
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  disabled={selectedFiles.length === 0 || isProcessing}
                  className="btn-primary flex items-center gap-2 px-12 py-4 text-lg disabled:opacity-50 disabled:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {statusMessage || "Converting..."}
                    </>
                  ) : (
                    <>
                      Convert to PDF
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
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
            <p className="text-gray-500 mb-8">Your PDF document is available for download and will be deleted in 24 hours.</p>

            <div className="flex justify-center gap-4">
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                Download PDF
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
