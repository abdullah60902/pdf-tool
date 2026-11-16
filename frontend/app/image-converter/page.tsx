"use client"

import React, { useState, useEffect } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import {
  ImageIcon,
  ArrowRight,
  Download,
  Loader2,
  RotateCcw,
  Settings2,
  Sparkles,
  Maximize,
  Layers,
  Palette,
  RefreshCcw,
  Zap,
  Info,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'
import { cn } from '@/lib/utils'

const FORMATS = [
  { id: 'webp', name: 'WebP', desc: 'Modern & Fast', color: 'from-cyan-500 to-blue-500' },
  { id: 'png', name: 'PNG', desc: 'Lossless', color: 'from-emerald-500 to-teal-500' },
  { id: 'jpg', name: 'JPG', desc: 'Universal', color: 'from-orange-500 to-rose-500' },
  { id: 'avif', name: 'AVIF', desc: 'Next-Gen', color: 'from-purple-500 to-indigo-500' },
  { id: 'tiff', name: 'TIFF', desc: 'Professional', color: 'from-gray-500 to-slate-500' },
  { id: 'svg', name: 'SVG', desc: 'Vectorization', color: 'from-yellow-500 to-amber-500' },
]

export default function ImageConverterPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [options, setOptions] = useState({
    targetFormat: 'webp',
    quality: 80,
    width: '',
    height: '',
    grayscale: false,
    negate: false,
    flip: false,
    flop: false,
    rotate: 0,
    blur: 0,
    sharpen: false
  })

  const { isProcessing, progress, resultUrl, processFiles, reset, statusMessage } = useFileProcessing()

  const handleConvert = () => {
    if (selectedFiles.length === 0) return
    processFiles('/image/convert', selectedFiles, options)
  }

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const updateOption = (key: keyof typeof options, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Header Section */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4"
        >
          <Sparkles size={16} />
          <span>Professional Conversion Engine</span>
        </motion.div>
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">
          Elite Image <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Studio</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Transform, resize, and optimize your images with industry-standard accuracy and zero quality loss.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {!resultUrl ? (
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <FileDropzone
                  onFilesSelected={setSelectedFiles}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.tiff', '.bmp'] }}
                  maxFiles={1}
                />
              </div>

              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    disabled={isProcessing}
                    onClick={handleConvert}
                    className="relative group inline-flex items-center justify-center gap-4 px-12 py-5 rounded-2xl bg-white text-black font-bold text-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        {statusMessage || 'Processing...'}
                      </>
                    ) : (
                      <>
                        Convert Image Now
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-[3rem] p-12 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <CheckCircle2 size={120} />
              </div>

              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 rotate-12 group hover:rotate-0 transition-transform duration-500">
                  <Download size={48} />
                </div>
                <h2 className="text-4xl font-black text-white mb-4">Masterpiece Ready!</h2>
                <p className="text-emerald-100/60 text-lg mb-12 max-w-sm mx-auto">
                  Your image has been processed using professional algorithms and is ready for download.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <a
                    href={resultUrl}
                    download={`converted-${Date.now()}.${options.targetFormat}`}
                    className="btn-primary px-10 py-5 text-xl bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3"
                  >
                    Download Now
                    <Download size={24} />
                  </a>
                  <button
                    onClick={() => { setSelectedFiles([]); reset(); }}
                    className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center justify-center gap-3"
                  >
                    <RefreshCcw size={24} />
                    Start Over
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {isProcessing && <ProgressBar progress={progress} />}
        </div>

        {/* Professional Sidebar Settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass rounded-[2rem] p-8 space-y-8 sticky top-24 border-white/5 bg-white/2 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white font-bold text-xl uppercase tracking-widest">
                <Settings2 size={24} className="text-cyan-400" />
                Settings
              </div>
            </div>

            {/* Formats Grid */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Layers size={14} /> Output Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {FORMATS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateOption('targetFormat', f.id)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all duration-300 relative group overflow-hidden",
                      options.targetFormat === f.id
                        ? "bg-white border-white"
                        : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
                    )}
                  >
                    <div className={cn(
                      "text-xs font-black uppercase mb-1",
                      options.targetFormat === f.id ? "text-black" : "text-gray-400"
                    )}>{f.id}</div>
                    <div className={cn(
                      "text-[10px] font-medium opacity-60",
                      options.targetFormat === f.id ? "text-black" : "text-gray-500"
                    )}>{f.desc}</div>
                    {options.targetFormat === f.id && (
                      <div className="absolute top-2 right-2 text-cyan-500">
                        <CheckCircle2 size={12} fill="currentColor" className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Precision Controls */}
            <div className="space-y-6 border-t border-white/5 pt-6">
              <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <Zap size={14} /> Processing Power
              </label>

              {/* Quality Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Quality</span>
                  <span className="text-cyan-400 font-mono font-bold bg-cyan-500/10 px-3 py-1 rounded-lg">
                    {options.quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1" max="100"
                  value={options.quality}
                  onChange={(e) => updateOption('quality', parseInt(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Resize Panel */}
              <div className="space-y-3">
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2 mb-2">
                  <Maximize size={14} /> Canvas Resize
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-600 block px-1">WIDTH (PX)</span>
                    <input
                      type="number"
                      placeholder="Auto"
                      value={options.width}
                      onChange={(e) => updateOption('width', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-gray-700 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-gray-600 block px-1">HEIGHT (PX)</span>
                    <input
                      type="number"
                      placeholder="Auto"
                      value={options.height}
                      onChange={(e) => updateOption('height', e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-gray-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Toggles Panel */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-4">
                  <Palette size={14} /> Filters & Effects
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'grayscale', name: 'Monochrome', icon: Palette },
                    { id: 'negate', name: 'Invert', icon: RefreshCcw },
                    { id: 'flip', name: 'Flip (V)', icon: Layers },
                    { id: 'flop', name: 'Flip (H)', icon: Maximize },
                    { id: 'sharpen', name: 'Sharpen', icon: Sparkles }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => toggleOption(filter.id as any)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border text-[11px] font-bold transition-all duration-300",
                        options[filter.id as keyof typeof options]
                          ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                          : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                      )}
                    >
                      <filter.icon size={12} />
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blur Slider */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 uppercase">
                  <span>Gaussian Blur</span>
                  <span className="text-cyan-400">{options.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0" max="20" step="0.5"
                  value={options.blur}
                  onChange={(e) => updateOption('blur', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <Info size={18} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-indigo-400 mb-1 leading-none pt-1">Pro Tip</h5>
              <p className="text-[11px] text-indigo-200/40 leading-relaxed">
                Processing occurs in separate isolated units. No data is stored beyond 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
