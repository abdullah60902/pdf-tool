"use client"

import React, { useState, useEffect } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { Zap, ArrowRight, Download, Loader2, RotateCcw, ShieldCheck, Cpu, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'

export default function CompressPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const { isProcessing, progress, resultUrl, resultData, processFiles, reset } = useFileProcessing()
  const [mode, setMode] = useState<'Basic' | 'Recommended' | 'Extreme'>('Recommended')
  const [statusMessage, setStatusMessage] = useState('')

  const handleCompress = () => {
    if (selectedFiles.length === 0) return

    const steps = [
      'Scanning PDF structure...',
      'Analyzing image DPI & metadata...',
      'Deep image recompression...',
      'Optimizing fonts & subsets...',
      'Rebuilding stream tree...',
      'Applying final compression...',
      'Verifying document integrity...'
    ]

    let step = 0;
    const interval = setInterval(() => {
      if (step < steps.length) {
        setStatusMessage(steps[step]);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 1800);

    processFiles('/pdf/compress', selectedFiles, { mode })
  }

  const getEstimatedSavings = () => {
    if (mode === 'Extreme') return '70-90%'
    if (mode === 'Recommended') return '30-60%'
    return '5-15%'
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-orange-500/20">
            <Zap size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-100 uppercase tracking-tight">AI PDF Optimizer</h1>
            <p className="text-gray-500 text-sm">Next-gen compression engine with intelligent DPI scaling.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-full border border-gray-800">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enterprise Secure</span>
        </div>
      </div>

      <div className="space-y-8">
        {!resultUrl ? (
          <>
            <FileDropzone
              onFilesSelected={(files) => setSelectedFiles(files.slice(0, 1))}
              maxFiles={1}
            />

            <AnimatePresence>
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: 'Basic', label: 'Pro Quality', desc: 'Highest Resolution', sub: 'Print-Ready' },
                      { id: 'Recommended', label: 'Balanced', desc: 'Smarter Scaling', sub: 'Best for Web' },
                      { id: 'Extreme', label: 'Maximum', desc: 'Deep Optimization', sub: 'Smallest File' }
                    ].map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setMode(m.id as any)}
                        className={`relative glass p-6 rounded-2xl text-center border transition-all duration-500 cursor-pointer group overflow-hidden ${mode === m.id ? 'border-amber-500 bg-amber-500/10 shadow-2xl shadow-amber-500/10' : 'border-gray-800 hover:border-gray-700'}`}
                      >
                        {mode === m.id && (
                          <motion.div layoutId="glow" className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-orange-500/5 pointer-events-none" />
                        )}
                        <h3 className={`font-bold transition-colors uppercase tracking-widest text-xs mb-1 ${mode === m.id ? 'text-amber-400' : 'text-gray-400'}`}>{m.label}</h3>
                        <p className="text-[10px] text-gray-500 font-bold mb-2">{m.desc}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-tighter font-medium">{m.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="glass rounded-2xl p-6 border-amber-500/10 flex flex-col md:flex-row items-center justify-between gap-6 bg-amber-500/[0.02]">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-900 rounded-xl border border-gray-800">
                        <Cpu size={24} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Engine Intelligence</p>
                        <p className="text-sm text-gray-300 font-medium">Estimated space savings: <span className="text-amber-500">{getEstimatedSavings()}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="h-10 w-px bg-gray-800 hidden md:block" />
                      <div className="flex-1 md:flex-none">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Processing Mode</p>
                        <div className="flex items-center gap-2">
                          <BarChart3 size={14} className="text-amber-500" />
                          <span className="text-xs font-bold text-gray-100">{mode.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      disabled={isProcessing}
                      onClick={handleCompress}
                      className="btn-primary w-full md:w-auto px-20 py-5 text-xl font-bold tracking-tight disabled:opacity-50 disabled:scale-100 from-amber-500 to-orange-600 shadow-2xl shadow-orange-500/30"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="animate-spin" />
                          <span>ENGINEERING PDF...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          OPTIMIZE DOCUMENT
                          <ArrowRight size={24} />
                        </div>
                      )}
                    </button>
                    {isProcessing && (
                      <div className="text-center">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-amber-500 text-[11px] font-black uppercase tracking-[0.3em] mb-2"
                        >
                          {statusMessage}
                        </motion.p>
                        <ProgressBar progress={progress} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center border-emerald-500/20 shadow-2xl shadow-emerald-500/5"
          >
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Download size={48} />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-100">Optimization Complete!</h2>

            {resultData?.stats && (
              <div className="flex flex-col gap-2 mb-10">
                <p className="text-gray-400 text-lg">
                  Successfully saved <span className="text-emerald-500 font-black">{resultData.stats.reduction}</span> of file size.
                </p>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="group">
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1 text-center">Original</p>
                    <div className="text-xs text-gray-500 font-mono bg-gray-950 px-4 py-2 rounded-xl border border-gray-800">
                      {(resultData.stats.originalSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-700 mt-4" />
                  <div className="group">
                    <p className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-widest mb-1 text-center font-black">Optimized</p>
                    <div className="text-xs text-emerald-500 font-mono bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                      {(resultData.stats.compressedSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-center gap-4">
              <a
                href={resultUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-2 from-emerald-500 to-teal-600 px-12 py-4 shadow-xl shadow-emerald-500/20 rounded-2xl"
              >
                Download PDF
                <Download size={22} />
              </a>
              <button
                onClick={() => {
                  setSelectedFiles([])
                  reset()
                }}
                className="px-12 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center gap-2 transition-all border border-gray-800 hover:border-gray-700"
              >
                <RotateCcw size={20} />
                Optimize More
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
