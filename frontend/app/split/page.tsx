"use client"

import React, { useState, useEffect } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import {
  Scissors,
  ArrowRight,
  Download,
  Loader2,
  RotateCcw,
  Info,
  Sparkles,
  Layers,
  CheckCircle2,
  Columns,
  FileOutput,
  RefreshCcw,
  Zap,
  Layout
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'
import PdfPagePicker from '@/components/PdfPagePicker'
import { cn } from '@/lib/utils'

export default function SplitPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [ranges, setRanges] = useState('')

  const { isProcessing, progress, resultUrl, processFiles, reset, statusMessage } = useFileProcessing()

  // Sync ranges with selectedPages
  useEffect(() => {
    if (selectedPages.length === 0) {
      setRanges('')
      return;
    }

    // Group consecutive pages into ranges (e.g. 1, 2, 3, 5 -> 1-3, 5)
    const sorted = [...selectedPages].sort((a, b) => a - b);
    const result: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        result.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }
    result.push(start === end ? `${start}` : `${start}-${end}`);
    setRanges(result.join(', '));
  }, [selectedPages]);

  const handleSplit = () => {
    if (selectedFiles.length === 0 || !ranges) return
    processFiles('/pdf/split', selectedFiles, { ranges })
  }

  const handleFileSelected = (files: File[]) => {
    setSelectedFiles(files.slice(0, 1));
    setSelectedPages([]);
    reset();
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-4"
        >
          <Scissors size={14} />
          <span>Professional PDF Extraction Engine</span>
        </motion.div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
          Visual <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Splitter</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Extract pages visually. Just select the pages you want from your document and we'll handle the rest.
        </p>
      </div>

      <div className="space-y-8">
        {!resultUrl ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Main Area */}
            <div className="lg:col-span-8 space-y-6">
              {!selectedFiles.length ? (
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <FileDropzone
                    onFilesSelected={handleFileSelected}
                    maxFiles={1}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="glass rounded-[2rem] p-4 bg-gray-900 border-white/5 shadow-2xl overflow-hidden">
                    <PdfPagePicker
                      file={selectedFiles[0]}
                      onSelectionChange={setSelectedPages}
                      selectedPages={selectedPages}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Settings */}
            <div className="lg:col-span-4 space-y-6">
              <div className="glass rounded-[2rem] p-8 space-y-8 sticky top-24 border-white/5 bg-white/2 shadow-2xl">
                <div className="flex items-center gap-3 text-white font-bold text-xl uppercase tracking-widest">
                  <Layout size={24} className="text-purple-400" />
                  Workspace
                </div>

                {selectedFiles.length > 0 ? (
                  <div className="space-y-6">
                    {/* File Info */}
                    <div className="p-4 rounded-xl bg-gray-900 border border-white/5 flex items-center gap-4 group">
                      <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <Columns size={18} />
                      </div>
                      <div className="flex-1 truncate">
                        <h4 className="text-sm font-bold text-white truncate">{selectedFiles[0].name}</h4>
                        <p className="text-xs text-gray-500">Selected Document</p>
                      </div>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="p-2 text-gray-700 hover:text-red-500 transition-colors"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    </div>

                    {/* Range Preview */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                        <Zap size={14} fill="currentColor" /> Range Preview
                      </label>
                      <div className="p-4 bg-gray-950 border border-white/5 rounded-xl font-mono text-cyan-400 text-center text-lg tracking-wider">
                        {ranges || "--"}
                      </div>
                      <div className="text-[10px] text-gray-500 text-center font-medium opacity-60">
                        Selection automatically determines the extract range.
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      disabled={selectedPages.length === 0 || isProcessing}
                      onClick={handleSplit}
                      className="w-full relative group inline-flex items-center justify-center gap-4 p-5 rounded-2xl bg-white text-black font-bold text-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          {statusMessage || 'Processing...'}
                        </>
                      ) : (
                        <>
                          Split PDF
                          <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 text-gray-800 rounded-full flex items-center justify-center mx-auto border border-dashed border-gray-800">
                      <FileOutput size={24} />
                    </div>
                    <p className="text-xs text-gray-700 font-bold uppercase tracking-widest">Awaiting file upload</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-[3rem] p-16 text-center border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <CheckCircle2 size={160} />
            </div>

            <div className="relative z-10">
              <div className="w-32 h-32 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30 rotate-12 animate-bounce">
                <Download size={64} />
              </div>
              <h2 className="text-5xl font-black text-white mb-4">Complete!</h2>
              <p className="text-emerald-100/60 text-xl font-medium mb-12 max-w-sm mx-auto">
                Your extracted PDF pages are ready for download.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a
                  href={resultUrl}
                  download={`split-document-${Date.now()}.pdf`}
                  className="btn-primary px-12 py-6 text-2xl bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-4"
                >
                  Download PDF
                  <Download size={32} />
                </a>
                <button
                  onClick={() => {
                    setSelectedFiles([])
                    setSelectedPages([])
                    setRanges('')
                    reset()
                  }}
                  className="px-12 py-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center justify-center gap-4"
                >
                  <RefreshCcw size={32} />
                  Extract More
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {isProcessing && <ProgressBar progress={progress} />}
      </div>
    </div>
  )
}
