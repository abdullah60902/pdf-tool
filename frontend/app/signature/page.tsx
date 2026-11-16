"use client"

import React, { useState } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { PenTool, ArrowRight, Download, Loader2, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'

export default function SignaturePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [signatureText, setSignatureText] = useState('John Doe')
  const [pageNumber, setPageNumber] = useState(1)
  const [positionX, setPositionX] = useState(50)
  const [positionY, setPositionY] = useState(50)
  const { isProcessing, progress, resultUrl, processFiles, reset } = useFileProcessing()

  const handleAddSignature = () => {
    if (selectedFiles.length === 0) return
    processFiles('/pdf/sign', selectedFiles, {
      signatureText,
      pageNumber: pageNumber.toString(),
      x: positionX.toString(),
      y: positionY.toString()
    })
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/20">
          <PenTool size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Add Signature</h1>
          <p className="text-gray-500 text-sm">Sign your documents digitally with ease and security.</p>
        </div>
      </div>

      <div className="space-y-8">
        {!resultUrl ? (
          <>
            <FileDropzone
              onFilesSelected={setSelectedFiles}
              maxFiles={1}
            />

            {selectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-8 space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-100 mb-4">Signature Settings</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Signature Text
                  </label>
                  <input
                    type="text"
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    placeholder="Enter your signature"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Page Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={pageNumber}
                      onChange={(e) => setPageNumber(parseInt(e.target.value) || 1)}
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Position X
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={positionX}
                      onChange={(e) => setPositionX(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Position Y
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={positionY}
                      onChange={(e) => setPositionY(parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    />
                  </div>
                </div>

                <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-800">
                  <p className="text-sm text-gray-400">
                    <strong className="text-gray-300">Tip:</strong> Position coordinates are in points from the bottom-left corner of the page.
                    Typical page size is 612x792 points (Letter size).
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex justify-center">
              <button
                disabled={selectedFiles.length === 0 || isProcessing}
                onClick={handleAddSignature}
                className="btn-primary flex items-center gap-2 px-12 py-4 text-lg disabled:opacity-50 disabled:scale-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Add Signature
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
            <p className="text-gray-500 mb-8">Your signed PDF is available for download and will be deleted in 24 hours.</p>

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
