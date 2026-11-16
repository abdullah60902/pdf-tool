"use client"

import React, { useState, useEffect, useRef } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import api from '@/lib/api'
import { toast } from 'sonner'
import * as pdfjsLib from 'pdfjs-dist'
import {
  Stamp,
  ArrowRight,
  Download,
  Loader2,
  RotateCcw,
  Type,
  Image as ImageIcon,
  Grid,
  Sun,
  Maximize,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  Layers,
  Layout,
  Type as FontIcon,
  Italic,
  Bold,
  Eye,
  Settings2,
  FileText,
  MousePointer2,
  ListFilter,
  AlertCircle,
  ShieldCheck
} from 'lucide-react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'
import { cn } from '@/lib/utils'

// Set up pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  { id: 'Helvetica', name: 'Arial / Helvetica' },
  { id: 'Courier', name: 'Courier (Monospace)' },
  { id: 'Times', name: 'Times New Roman' },
]

export default function PdfWatermarkPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text')
  const [text, setText] = useState('CONFIDENTIAL')
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null)
  const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState('')

  const { isProcessing, progress, resultUrl, resultData, processFiles, reset, statusMessage } = useFileProcessing()

  const handleDownloadClick = async () => {
    if (!resultUrl) return;

    // Force a physical download anchor
    const a = document.createElement('a');
    a.href = resultUrl;
    a.target = '_blank'; // CRITICAL: Prevent React from unloading when grabbing the file!
    a.download = `protected-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Download starting in a new tab!', { description: 'Securely wiping the source file from our servers in 10 seconds...' });

    // Wait 10 seconds to guarantee the browser fully downloads/caches the PDF before wiping
    setTimeout(async () => {
      try {
        if (resultData && resultData.cloudinaryId) {
          await api.post('/pdf/cleanup', { cloudinaryId: resultData.cloudinaryId });
          toast.success('Privacy Secured ✔️', { description: 'Your file has been permanently purged from the cloud servers.' });
        }
      } catch (err) {
        console.error("Auto-cleanup failed:", err);
      }
    }, 10000);
  };

  const [options, setOptions] = useState({
    opacity: 0.3,
    rotate: 45,
    gravity: 'center',
    placementMode: 'preset' as 'preset' | 'manual',
    color: '#ff0000',
    fontSize: 52,
    layering: 'over',
    ranges: 'all',
    scale: 0.3,
    font: 'Helvetica',
    xOffset: 0,
    yOffset: 0,
    tiled: false
  })

  // Ghost Preview State
  const [ghostPos, setGhostPos] = useState<{ x: number, y: number } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [justClicked, setJustClicked] = useState(false)

  // PDF Preview Logic
  const [pagePreview, setPagePreview] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [pdfPageDims, setPdfPageDims] = useState<{ width: number, height: number }>({ width: 595, height: 842 }) // A4 default
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedFile) {
      renderPreview()
    } else {
      setPagePreview(null)
    }
  }, [selectedFile])

  useEffect(() => {
    if (watermarkFile) {
      const url = URL.createObjectURL(watermarkFile)
      setWatermarkPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [watermarkFile])

  const renderPreview = async () => {
    if (!selectedFile) return
    setPreviewLoading(true)
    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const page = await pdf.getPage(1)

      // Store ACTUAL PDF page dimensions in points (no scale)
      const rawViewport = page.getViewport({ scale: 1.0 })
      setPdfPageDims({ width: rawViewport.width, height: rawViewport.height })

      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) return

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise
      setPagePreview(canvas.toDataURL())
    } catch (err) {
      console.error('Preview error:', err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleProcess = () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('pdfFile', selectedFile)
    formData.append('type', watermarkType)
    formData.append('text', text)
    formData.append('opacity', options.opacity.toString())
    formData.append('gravity', options.gravity)
    formData.append('rotate', options.rotate.toString())
    formData.append('color', options.color)
    formData.append('fontSize', options.fontSize.toString())
    formData.append('ranges', options.ranges)
    formData.append('layering', options.layering)
    formData.append('scale', options.scale.toString())
    formData.append('font', options.font)
    formData.append('placementMode', options.placementMode)
    formData.append('xOffset', options.xOffset.toString())
    formData.append('yOffset', options.yOffset.toString())

    if (watermarkFile) formData.append('watermarkImage', watermarkFile)

    processFiles('/pdf/watermark', [], {}, formData)
  }

  const handleDragEnd = (event: any, info: any) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    // Calculate actual scale: how many PDF points per browser pixel
    const scaleX = pdfPageDims.width / rect.width;
    const scaleY = pdfPageDims.height / rect.height;
    setOptions(prev => ({
      ...prev,
      xOffset: prev.xOffset + (info.offset.x * scaleX),
      yOffset: prev.yOffset - (info.offset.y * scaleY) // PDF Y is bottom-up
    }))
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    setGhostPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate ACTUAL scale ratio: PDF points per browser pixel
    const scaleX = pdfPageDims.width / rect.width;
    const scaleY = pdfPageDims.height / rect.height;

    const margin = 15;
    const clampedX = Math.max(margin, Math.min(clickX, rect.width - margin));
    const clampedY = Math.max(margin, Math.min(clickY, rect.height - margin));

    // Convert browser click to PDF coordinates
    const pdfX = clampedX * scaleX;
    const pdfY = (rect.height - clampedY) * scaleY; // Flip Y for PDF bottom-up

    setJustClicked(true)
    setTimeout(() => setJustClicked(false), 500)

    setOptions(prev => ({
      ...prev,
      gravity: 'northwest',
      placementMode: 'manual',
      xOffset: pdfX,
      yOffset: pdfY
    }))
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
        >
          <Stamp size={16} />
          <span>Professional PDF Protection</span>
        </motion.div>
        <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">
          Watermark <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Studio</span>
        </h1>
      </div>

      {!resultUrl ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass rounded-[2rem] p-8 space-y-8 border-white/5 bg-white/2 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 text-white font-bold text-xl uppercase tracking-widest border-b border-white/5 pb-6">
                <Settings2 size={24} className="text-blue-400" />
                Editor
              </div>

              {/* Step 1: Upload */}
              {!selectedFile ? (
                <FileDropzone
                  onFilesSelected={(files) => setSelectedFile(files[0])}
                  accept={{ 'application/pdf': ['.pdf'] }}
                  maxFiles={1}
                />
              ) : (
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between group">
                  <div className="flex items-center gap-3 truncate">
                    <FileText size={20} className="text-blue-400" />
                    <span className="text-sm font-bold text-white truncate">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <RefreshCcw size={16} className="text-gray-500" />
                  </button>
                </div>
              )}

              {selectedFile && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Type Toggle */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={12} /> Watermark Type
                    </label>
                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                      <button
                        onClick={() => setWatermarkType('text')}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all",
                          watermarkType === 'text' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                        )}
                      >
                        <Type size={14} /> Text
                      </button>
                      <button
                        onClick={() => setWatermarkType('image')}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-xs font-bold transition-all",
                          watermarkType === 'image' ? "bg-white text-black shadow-lg" : "text-gray-500 hover:text-white"
                        )}
                      >
                        <ImageIcon size={14} /> Image
                      </button>
                    </div>
                  </div>

                  {/* Text Inputs */}
                  {watermarkType === 'text' ? (
                    <div className="space-y-4">
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-gray-950 border border-white/10 rounded-2xl p-4 text-white text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none min-h-[100px]"
                        placeholder="Enter watermark text..."
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={options.font}
                          onChange={(e) => setOptions(prev => ({ ...prev, font: e.target.value }))}
                          className="bg-gray-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                        >
                          {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <input
                          type="color"
                          value={options.color}
                          onChange={(e) => setOptions(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full h-10 bg-transparent cursor-pointer rounded-xl overflow-hidden"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative",
                      watermarkFile ? "border-blue-500 bg-blue-500/5" : "border-white/10 hover:border-white/20 bg-black/20"
                    )}>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setWatermarkFile(e.target.files?.[0] || null)}
                        accept="image/*"
                      />
                      {watermarkFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <img src={watermarkPreviewUrl} className="w-12 h-12 object-contain rounded-lg" />
                          <span className="text-xs font-bold text-white truncate max-w-full">{watermarkFile.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-500">
                          <Download size={24} />
                          <p className="text-[10px] font-bold uppercase">Upload Logo</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Appearance Sliders */}
                  <div className="space-y-6 pt-6 border-t border-white/5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                        <span>Opacity</span>
                        <span className="text-blue-400">{Math.round(options.opacity * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={options.opacity}
                        onChange={(e) => setOptions(prev => ({ ...prev, opacity: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                        <span>Rotation</span>
                        <span className="text-blue-400">{options.rotate}°</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <input
                          type="range" min="-180" max="180" step="1"
                          value={options.rotate}
                          onChange={(e) => setOptions(prev => ({ ...prev, rotate: parseInt(e.target.value) }))}
                          className="flex-1 accent-blue-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                        />
                        <button onClick={() => setOptions(prev => ({ ...prev, rotate: 45 }))} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-black text-white">45°</button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
                        <span>{watermarkType === 'text' ? 'Font Size' : 'Scale'}</span>
                        <span className="text-blue-400">{watermarkType === 'text' ? options.fontSize : Math.round(options.scale * 100) + '%'}</span>
                      </div>
                      <input
                        type="range"
                        min={watermarkType === 'text' ? 8 : 0.05}
                        max={watermarkType === 'text' ? 144 : 2}
                        step={watermarkType === 'text' ? 1 : 0.05}
                        value={watermarkType === 'text' ? options.fontSize : options.scale}
                        onChange={(e) => setOptions(prev => ({ ...prev, [watermarkType === 'text' ? 'fontSize' : 'scale']: parseFloat(e.target.value) }))}
                        className="w-full accent-blue-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Smart Presets (User Pro Tip) */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Sparkles size={12} className="text-yellow-400" /> Smart Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setOptions(prev => ({ ...prev, layering: 'under', opacity: 0.15 }))}
                        className="group relative p-4 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all text-left"
                      >
                        <div className="text-[10px] font-black text-emerald-400 uppercase mb-1">Subtle Branding</div>
                        <div className="text-[9px] text-emerald-300/60 leading-tight">Behind text, 15% Opacity. Clean & Professional.</div>
                      </button>
                      <button
                        onClick={() => setOptions(prev => ({ ...prev, layering: 'over', opacity: 0.35, rotate: 45 }))}
                        className="group relative p-4 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-all text-left"
                      >
                        <div className="text-[10px] font-black text-blue-400 uppercase mb-1">Strict Protection</div>
                        <div className="text-[9px] text-blue-300/60 leading-tight">Top layer, 35% Opacity, 45° Angle. High Security.</div>
                      </button>
                    </div>
                  </div>

                  {/* Master Layering Selection */}
                  <div className="space-y-4 py-6 border-t border-white/5">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2 tracking-widest">
                      <Layers size={12} /> Master Layering
                    </label>
                    <div className="grid grid-cols-2 p-1 bg-gray-950/50 rounded-2xl border border-white/5 relative overflow-hidden">
                      <button
                        onClick={() => setOptions(prev => ({ ...prev, layering: 'over' }))}
                        className={cn(
                          "relative z-10 py-3 text-[11px] font-black uppercase rounded-xl transition-all duration-500",
                          options.layering === 'over' ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        Over Content
                        {options.layering === 'over' && <motion.div layoutId="layerTab" className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl -z-10 shadow-lg shadow-blue-600/10" />}
                      </button>
                      <button
                        onClick={() => setOptions(prev => ({ ...prev, layering: 'under' }))}
                        className={cn(
                          "relative z-10 py-3 text-[11px] font-black uppercase rounded-xl transition-all duration-500",
                          options.layering === 'under' ? "text-white" : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        Under Content
                        {options.layering === 'under' && <motion.div layoutId="layerTab" className="absolute inset-0 bg-blue-600/20 border border-blue-500/30 rounded-xl -z-10 shadow-lg shadow-blue-600/10" />}
                      </button>
                    </div>
                    {options.layering === 'over' && (
                      <div className="p-3 bg-blue-900/10 border border-blue-500/10 rounded-xl flex items-start gap-3">
                        <AlertCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-blue-300/80 leading-relaxed font-medium">
                          <span className="text-blue-400 font-bold block mb-1 underline decoration-dotted">FOR SECURITY:</span>
                          Use <span className="text-white">15-20% Opacity</span> to ensure the text below remains perfectly readable while protected.
                        </p>
                      </div>
                    )}
                    {options.layering === 'under' && (
                      <div className="p-3 bg-emerald-900/10 border border-emerald-500/10 rounded-xl flex items-start gap-3">
                        <ShieldCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-emerald-300/80 leading-relaxed font-medium">
                          <span className="text-emerald-400 font-bold block mb-1 underline decoration-dotted">FOR BRANDING:</span>
                          Draws watermark <span className="text-white">behind text</span>. Best for clean, professional documents.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Position 9-Grid */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><Grid size={12} /> Auto Placement</label>
                      <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
                      >
                        {showAdvanced ? 'Hide Advanced' : 'Show Manual Offsets'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full max-w-[150px] mx-auto">
                      {POSITIONS.map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => setOptions(prev => ({ ...prev, gravity: pos.id, placementMode: 'preset', xOffset: 0, yOffset: 0 }))}
                          className={cn(
                            "aspect-square rounded-lg border-2 flex items-center justify-center transition-all",
                            options.gravity === pos.id && options.placementMode === 'preset'
                              ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                              : "border-white/5 bg-white/5 hover:border-white/20"
                          )}
                        >
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            options.gravity === pos.id && options.placementMode === 'preset' ? "bg-white scale-150" : "bg-gray-700"
                          )} />
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-4 mt-6 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-700 uppercase">X-Offset</label>
                            <input type="number" value={Math.round(options.xOffset)} onChange={(e) => setOptions(prev => ({ ...prev, xOffset: parseInt(e.target.value) || 0 }))} className="w-full bg-gray-950 border border-white/5 rounded-lg p-2 text-white text-xs" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-700 uppercase">Y-Offset</label>
                            <input type="number" value={Math.round(options.yOffset)} onChange={(e) => setOptions(prev => ({ ...prev, yOffset: parseInt(e.target.value) || 0 }))} className="w-full bg-gray-950 border border-white/5 rounded-lg p-2 text-white text-xs" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Page Range */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-2"><ListFilter size={12} /> Page Settings</label>
                    <select
                      value={options.ranges}
                      onChange={(e) => setOptions(prev => ({ ...prev, ranges: e.target.value }))}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none"
                    >
                      <option value="all">All Pages</option>
                      <option value="first">First Page Only</option>
                      <option value="last">Last Page Only</option>
                      <option value="custom">Custom Range...</option>
                    </select>
                    {options.ranges === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g. 1-2, 5"
                        className="w-full bg-gray-950 border border-white/10 rounded-xl p-3 text-xs text-white outline-none mt-2"
                        onChange={(e) => setOptions(prev => ({ ...prev, ranges: e.target.value }))}
                      />
                    )}
                  </div>

                  {/* Final Action */}
                  <button
                    disabled={!selectedFile || isProcessing || (watermarkType === 'image' && !watermarkFile)}
                    onClick={handleProcess}
                    className="w-full relative group inline-flex items-center justify-center gap-4 px-8 py-5 rounded-3xl bg-white text-black font-black text-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:scale-100 shadow-[0_20px_60px_rgba(255,255,255,0.1)]"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Saving...
                      </>
                    ) : (
                      <>
                        Apply Watermark
                        <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Area: Preview */}
          <div className="lg:col-span-8">
            <div className="glass rounded-[3rem] p-12 bg-black/40 border-white/5 min-h-[700px] flex flex-col items-center justify-center relative overflow-hidden group">

              {/* Preview Stage */}
              {pagePreview ? (
                <div
                  className="relative shadow-2xl rounded-lg overflow-hidden border border-white/10 group bg-white cursor-none inline-block max-w-full"
                  ref={previewContainerRef}
                  onClick={handlePreviewClick}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setGhostPos(null)}
                >
                  <img src={pagePreview} className="max-w-full max-h-[800px] block select-none pointer-events-none" alt="PDF Preview" />

                  {/* Placement Success Flash */}
                  <AnimatePresence>
                    {justClicked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 2 }}
                        className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
                      >
                        <div className="bg-blue-600/80 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 shadow-2xl flex items-center gap-4">
                          <CheckCircle2 className="text-white w-8 h-8 animate-bounce" />
                          <span className="text-xl font-black text-white uppercase italic tracking-widest">STUCK!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* High-Precision Placement Crosshair + Ghost Preview */}
                  <AnimatePresence>
                    {ghostPos && !isProcessing && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          left: ghostPos.x,
                          top: ghostPos.y,
                          position: 'absolute',
                          pointerEvents: 'none',
                        }}
                        className="z-[60] flex items-center justify-center translate-x-[-50%] translate-y-[-50%]"
                      >
                        <div className="relative flex items-center justify-center">
                          {/* The Ghost Content */}
                          <div className="opacity-20 pointer-events-none scale-90" style={{ transform: `rotate(${options.rotate}deg)` }}>
                            {watermarkType === 'text' ? (
                              <div style={{ fontSize: `${options.fontSize * ((previewContainerRef.current?.clientWidth || pdfPageDims.width) / pdfPageDims.width)}px`, color: options.color, fontFamily: options.font === 'Helvetica' ? 'Arial' : options.font }} className="font-black whitespace-nowrap">{text}</div>
                            ) : (
                              watermarkPreviewUrl && <img src={watermarkPreviewUrl} className="w-64 h-auto grayscale" />
                            )}
                          </div>

                          {/* The Crosshair (Centered) */}
                          <div className="absolute w-8 h-[2px] bg-blue-500/50 shadow-lg" />
                          <div className="absolute h-8 w-[2px] bg-blue-500/50 shadow-lg" />
                          <div className="absolute w-2 h-2 bg-white border-2 border-blue-600 rounded-full shadow-2xl" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Watermark Simulation (PRESET LAYER) */}
                  {options.placementMode === 'preset' && (
                    <motion.div
                      style={{
                        mixBlendMode: options.layering === 'under' ? 'multiply' : 'normal',
                      }}
                      animate={{
                        rotate: Number(options.rotate),
                        opacity: options.layering === 'under' ? 0.15 : options.opacity,
                        scale: watermarkType === 'image' ? options.scale : 1,
                      }}
                      className={cn(
                        "absolute inset-0 flex p-[15px] pointer-events-none z-30",
                        options.gravity === 'northwest' && "items-start justify-start",
                        options.gravity === 'north' && "items-start justify-center",
                        options.gravity === 'northeast' && "items-start justify-end",
                        options.gravity === 'west' && "items-center justify-start",
                        options.gravity === 'center' && "items-center justify-center",
                        options.gravity === 'east' && "items-center justify-end",
                        options.gravity === 'southwest' && "items-end justify-start",
                        options.gravity === 'south' && "items-end justify-center",
                        options.gravity === 'southeast' && "items-end justify-end",
                      )}
                    >
                      <div className="transition-all duration-300">
                        {watermarkType === 'text' ? (
                          <div style={{ fontSize: `${options.fontSize * ((previewContainerRef.current?.clientWidth || pdfPageDims.width) / pdfPageDims.width)}px`, color: options.color, fontFamily: options.font === 'Helvetica' ? 'Arial' : options.font }} className="font-black whitespace-nowrap">{text}</div>
                        ) : (
                          watermarkPreviewUrl && <img src={watermarkPreviewUrl} className="w-64 h-auto" />
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Watermark Simulation (Real / Manual) */}
                  <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                    {options.placementMode === 'manual' && (
                      <motion.div
                        drag
                        onDragEnd={handleDragEnd}
                        whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                        whileTap={{ scale: 0.9 }}
                        key={`${options.xOffset}-${options.yOffset}`}
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{
                          rotate: Number(options.rotate),
                          opacity: options.layering === 'under' ? 0.15 : options.opacity,
                          scale: watermarkType === 'image' ? options.scale : 1,
                          x: (options.xOffset / pdfPageDims.width) * (previewContainerRef.current?.clientWidth || 400),
                          y: (previewContainerRef.current?.clientHeight || 600) - ((options.yOffset / pdfPageDims.height) * (previewContainerRef.current?.clientHeight || 600))
                        }}
                        style={{
                          translateX: '-50%',
                          translateY: '-50%',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          mixBlendMode: options.layering === 'under' ? 'multiply' : 'normal'
                        }}
                        className="items-start justify-start p-0 cursor-grab active:cursor-grabbing pointer-events-auto"
                      >
                        <div className="transition-all duration-300">
                          {watermarkType === 'text' ? (
                            <div style={{ fontSize: `${options.fontSize * ((previewContainerRef.current?.clientWidth || pdfPageDims.width) / pdfPageDims.width)}px`, color: options.color, fontFamily: options.font === 'Helvetica' ? 'Arial' : options.font }} className="font-black whitespace-nowrap">{text}</div>
                          ) : (
                            watermarkPreviewUrl && <img src={watermarkPreviewUrl} className="w-64 h-auto" />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="absolute top-4 left-4 z-50 p-4 bg-blue-600/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl pointer-events-none">
                    <div className="flex items-center gap-2 text-xs font-black text-white uppercase italic">
                      <MousePointer2 size={16} className="animate-pulse" />
                      CLICK ANYWHERE ON PDF TO PLACE
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-dashed border-white/20 group-hover:scale-110 transition-transform">
                    <MousePointer2 size={40} className="text-gray-700" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 uppercase tracking-widest leading-loose">
                    Upload a PDF to open the <br /> <span className="text-blue-500/50">Interactive Preview Studio</span>
                  </p>
                </div>
              )}

              {previewLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                  <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                  <p className="text-white font-bold animate-pulse">Scanning PDF Structure...</p>
                </div>
              )}
            </div>

            {/* Info Tip */}
            <div className="mt-8 p-6 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Sparkles size={20} />
              </div>
              <div>
                <h5 className="text-sm font-bold text-blue-400 mb-1 leading-none pt-1">Pro Feature: Page Range Logic</h5>
                <p className="text-xs text-blue-200/40 leading-relaxed">
                  Use the selector in the sidebar to apply watermarks exactly where needed—all pages, or just specific ranges like '1-3, 5'.
                </p>
              </div>
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
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-500/30 rotate-12 animate-bounce">
              <Download size={48} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">PDF Protected!</h2>
            <p className="text-emerald-100/60 text-lg mb-12 max-w-sm mx-auto leading-relaxed">
              Your watermark has been burned into the PDF document with professional precision.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button
                onClick={handleDownloadClick}
                className="btn-primary px-12 py-5 text-xl bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 rounded-2xl text-white font-bold transition-all"
              >
                Download Protected PDF
                <Download size={24} />
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null)
                  setWatermarkFile(null)
                  reset()
                }}
                className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold border border-white/10 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCcw size={24} />
                Choose New File
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {isProcessing && <ProgressBar progress={progress} />}
    </div>
  )
}
