"use client"

import React, { useState, useEffect, useRef } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import {
  Stamp,
  ArrowRight,
  Download,
  Loader2,
  RotateCcw,
  Settings2,
  Type,
  Image as ImageIcon,
  Grid,
  Sun,
  Maximize,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Sparkles,
  Layers,
  Palette,
  Eye,
  Trash2,
  FileImage
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'
import { cn } from '@/lib/utils'

const POSITIONS = [
  { id: 'northwest', label: 'Top Left' },
  { id: 'north', label: 'Top' },
  { id: 'northeast', label: 'Top Right' },
  { id: 'west', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'east', label: 'Right' },
  { id: 'southwest', label: 'Bottom Left' },
  { id: 'south', label: 'Bottom' },
  { id: 'southeast', label: 'Bottom Right' },
]

const FONTS = [
  { id: 'Arial', name: 'Arial (Standard)' },
  { id: 'Inter', name: 'Inter (Modern)' },
  { id: 'Roboto', name: 'Roboto (Clean)' },
  { id: 'Playfair Display', name: 'Playfair (Elegant)' },
  { id: 'Oswald', name: 'Oswald (Bold)' },
]

export default function ImageWatermarkPage() {
  const [targetFiles, setTargetFiles] = useState<File[]>([])
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text')
  const [text, setText] = useState('© CLOUD PDF')
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null)
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState('')

  const [options, setOptions] = useState({
    opacity: 0.5,
    rotate: 0,
    gravity: 'center',
    color: '#ffffff',
    fontSize: 52,
    tile: false,
    font: 'Arial'
  })

  const { isProcessing, progress, results, processFiles, reset, statusMessage } = useFileProcessing()

  // Preview logic
  const [mainPreview, setMainPreview] = useState('')

  useEffect(() => {
    if (targetFiles.length > 0) {
      const url = URL.createObjectURL(targetFiles[0])
      setMainPreview(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [targetFiles])

  useEffect(() => {
    if (watermarkFile) {
      const url = URL.createObjectURL(watermarkFile)
      setWatermarkPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [watermarkFile])

  const handleProcess = async () => {
    if (targetFiles.length === 0) return

    // Manual multipart form construction for batch + watermark file
    const formData = new FormData()
    formData.append('type', watermarkType)
    formData.append('text', text)
    formData.append('opacity', options.opacity.toString())
    formData.append('gravity', options.gravity)
    formData.append('rotate', options.rotate.toString())
    formData.append('color', options.color)
    formData.append('fontSize', options.fontSize.toString())
    formData.append('tile', options.tile.toString())
    formData.append('font', options.font)

    targetFiles.forEach(f => formData.append('targetImages', f))
    if (watermarkFile) formData.append('watermarkFile', watermarkFile)

    processFiles('/image/watermark', [], {}, formData)
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-4"
        >
          <Sparkles size={16} />
          <span>Professional Image Protection</span>
        </motion.div>
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
          Watermark <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Pro</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Secure your artistic work with elite-grade watermarking. Batch process dozens of images in seconds.
        </p>
      </div>

      {!results ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Editor Area (Left/Center) */}
          <div className="xl:col-span-8 space-y-6">
            {!targetFiles.length ? (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <FileDropzone
                  onFilesSelected={setTargetFiles}
                  accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                  maxFiles={20}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Live Preview Container */}
                <div className="glass rounded-[3rem] p-4 bg-black/40 border-white/5 relative overflow-hidden flex items-center justify-center min-h-[500px] group">
                  {/* Simulation Overlay for Preview */}
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-gray-500 border border-white/10 uppercase tracking-widest">
                    Live Simulation (First Image)
                  </div>

                  <div className="relative flex items-center justify-center max-h-[100%] w-full">
                    <img src={mainPreview} className="max-w-full max-h-[600px] rounded-2xl shadow-2xl object-contain" alt="Preview" />

                    {/* Watermark Simulation Overlay (CSS based) */}
                    <div className={cn(
                      "absolute inset-0 pointer-events-none flex p-8",
                      options.gravity === 'northwest' && "items-start justify-start",
                      options.gravity === 'north' && "items-start justify-center",
                      options.gravity === 'northeast' && "items-start justify-end",
                      options.gravity === 'west' && "items-center justify-start",
                      options.gravity === 'center' && "items-center justify-center",
                      options.gravity === 'east' && "items-center justify-end",
                      options.gravity === 'southwest' && "items-end justify-start",
                      options.gravity === 'south' && "items-end justify-center",
                      options.gravity === 'southeast' && "items-end justify-end",
                      options.tile && "flex-wrap items-stretch justify-stretch !p-0"
                    )}>
                      {!options.tile ? (
                        <motion.div
                          animate={{ rotate: Number(options.rotate), opacity: options.opacity }}
                          className="transition-all duration-300"
                        >
                          {watermarkType === 'text' ? (
                            <span style={{ fontSize: `${options.fontSize / 2}px`, color: options.color, fontFamily: options.font }} className="font-black drop-shadow-lg whitespace-nowrap">
                              {text}
                            </span>
                          ) : (
                            watermarkPreviewUrl ? (
                              <img src={watermarkPreviewUrl} className="w-32 h-auto drop-shadow-2xl" />
                            ) : <div className="p-4 bg-white/10 border border-dashed border-white/20 rounded-xl text-xs text-white/40 italic">Watermark image missing</div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="w-full h-full opacity-50 overflow-hidden flex flex-wrap gap-12 p-8 scale-150" style={{ opacity: options.opacity }}>
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} style={{ rotate: `${options.rotate}deg`, fontSize: `${options.fontSize / 3}px`, color: options.color }} className="font-bold opacity-30">
                              {watermarkType === 'text' ? text : 'IMAGE'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Target List */}
                <div className="bg-white/2 rounded-2xl border border-white/5 p-6 overflow-x-auto">
                  <div className="flex items-center gap-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Batch Ready:</h4>
                    <div className="flex gap-3">
                      {targetFiles.map((f, i) => (
                        <div key={i} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-600 font-bold overflow-hidden relative group">
                          <FileImage size={24} opacity={0.3} />
                          <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-red-500/80 transition-all flex items-center justify-center cursor-pointer" onClick={() => setTargetFiles(prev => prev.filter((_, idx) => idx !== i))}>
                            <Trash2 size={12} className="text-white opacity-0 group-hover:opacity-100" />
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setTargetFiles([])} className="text-xs text-gray-600 hover:text-white transition-colors uppercase font-bold px-4">Clear All</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Sidebar (Right) */}
          <div className="xl:col-span-4 space-y-6">
            <div className="glass rounded-[2rem] p-8 space-y-8 sticky top-24 border-white/5 bg-white/2 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-3 text-white font-black text-xl tracking-wider">
                  <Settings2 size={24} className="text-cyan-400" />
                  CONTROLS
                </div>
                <div className="text-[10px] font-bold text-cyan-500/40">{targetFiles.length} FILES</div>
              </div>

              {/* Mode Selector */}
              <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  onClick={() => setWatermarkType('text')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                    watermarkType === 'text' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  <Type size={16} /> Text
                </button>
                <button
                  onClick={() => setWatermarkType('image')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                    watermarkType === 'image' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                  )}
                >
                  <ImageIcon size={16} /> Image
                </button>
              </div>

              {/* Contextual Input */}
              <AnimatePresence mode="wait">
                {watermarkType === 'text' ? (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Palette size={12} /> Branding Text</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full bg-gray-900/50 border border-white/10 rounded-xl px-5 py-4 text-white font-bold tracking-tight focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none shadow-inner"
                      placeholder="Enter your text..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase">Font</label>
                        <select
                          value={options.font}
                          onChange={(e) => setOptions(prev => ({ ...prev, font: e.target.value }))}
                          className="w-full bg-gray-950 border border-white/10 rounded-lg p-3 text-white text-xs outline-none"
                        >
                          {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase">Color</label>
                        <input type="color" value={options.color} onChange={(e) => setOptions(prev => ({ ...prev, color: e.target.value }))} className="w-full h-12 bg-transparent rounded-lg cursor-pointer border-none" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-600 uppercase">Size</label>
                        <input type="number" value={options.fontSize} onChange={(e) => setOptions(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))} className="w-full bg-gray-950 border border-white/10 rounded-lg p-3 text-white font-mono text-sm" />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Layers size={12} /> Logo Upload</label>
                    <div className={cn(
                      "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative",
                      watermarkFile ? "border-cyan-500 bg-cyan-500/5" : "border-white/10 hover:border-white/20 bg-black/20"
                    )}>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)}
                        accept="image/*"
                      />
                      {watermarkFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-lg bg-black/40 p-2 overflow-hidden">
                            <img src={watermarkPreviewUrl} className="w-full h-full object-contain" />
                          </div>
                          <span className="text-xs font-bold text-white truncate max-w-full">{watermarkFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-500">
                            <Download size={20} />
                          </div>
                          <p className="text-[10px] font-bold text-gray-600 uppercase">Click or Drop Logo</p>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Position Grid (The 9-dots) */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Grid size={12} /> Placement</label>
                <div className="grid grid-cols-3 gap-2 w-full max-w-[200px] mx-auto">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setOptions(prev => ({ ...prev, gravity: pos.id }))}
                      className={cn(
                        "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
                        options.gravity === pos.id
                          ? "border-cyan-500 bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                          : "border-white/5 bg-white/5 hover:border-white/20"
                      )}
                      title={pos.label}
                    >
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        options.gravity === pos.id ? "bg-white scale-150" : "bg-gray-700"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* sliders */}
              <div className="space-y-6 pt-4 border-t border-white/5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                    <span>Opacity</span>
                    <span className="text-cyan-400 font-mono">{Math.round(options.opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05" max="1" step="0.05"
                    value={options.opacity}
                    onChange={(e) => setOptions(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                    className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                    <span>Rotation</span>
                    <span className="text-cyan-400 font-mono">{options.rotate}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180" max="180" step="5"
                    value={options.rotate}
                    onChange={(e) => setOptions(prev => ({ ...prev, rotate: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enable Tiling</span>
                  <button
                    onClick={() => setOptions(prev => ({ ...prev, tile: !prev.tile }))}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors relative",
                      options.tile ? "bg-cyan-500" : "bg-gray-800"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-transform shadow-md",
                      options.tile ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              {/* Final Action */}
              <button
                disabled={targetFiles.length === 0 || isProcessing || (watermarkType === 'image' && !watermarkFile)}
                onClick={handleProcess}
                className="w-full relative group inline-flex items-center justify-center gap-4 px-8 py-5 rounded-2xl bg-white text-black font-black text-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Protecting...
                  </>
                ) : (
                  <>
                    Protect {targetFiles.length} Images
                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>
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

          <div className="relative z-10 text-center">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30 rotate-12">
              <Download size={48} />
            </div>
            <h2 className="text-5xl font-black text-white mb-4">Shield Activated!</h2>
            <p className="text-emerald-100/60 text-xl mb-12 max-w-md mx-auto leading-relaxed">
              Success! All {results.length} images have been watermarked with the requested configuration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto gap-4 mb-12">
              {results.map((res: any, i: number) => (
                <div key={i} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center justify-between group overflow-hidden">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <FileImage size={18} />
                    </div>
                    <span className="text-xs font-bold text-gray-300 truncate">{res.originalName}</span>
                  </div>
                  <a
                    href={res.url}
                    download={res.originalName.replace(/\.[^/.]+$/, "") + '_protected.jpg'}
                    className="p-2 bg-emerald-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setTargetFiles([])
                  setWatermarkFile(null)
                  reset()
                }}
                className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCcw size={24} />
                New Batch
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {isProcessing && <ProgressBar progress={progress} />}
    </div>
  )
}
