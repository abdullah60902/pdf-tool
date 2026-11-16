"use client"

import React, { useState, useEffect, useRef } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import {
  RotateCw, RotateCcw, ArrowRight, Download, Loader2,
  CheckCircle2, MousePointer2, Scan, Layers, CheckSquare
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'
import * as pdfjs from 'pdfjs-dist'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PageState {
  index: number;
  rotation: number; // Current visual rotation (0, 90, 180, 270)
  thumbnail: string;
}

export default function RotatePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [pages, setPages] = useState<PageState[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const { isProcessing, progress, resultUrl, resultData, processFiles, reset } = useFileProcessing()
  const lastSelectedIndex = useRef<number | null>(null);

  // Load PDF and generate thumbnails
  useEffect(() => {
    if (selectedFiles.length > 0) {
      loadPDFThumbnails(selectedFiles[0]);
      analyzeDocument(selectedFiles[0]);
    } else {
      setPages([]);
      setSelectedIndices([]);
      setSuggestions(null);
    }
  }, [selectedFiles]);

  const analyzeDocument = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const host = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${host}/pdf/analyze-rotation`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.audit && data.audit.suggestions.length > 0) {
        setSuggestions(data.audit);
      }
    } catch (err) {
      console.warn('Analysis failed (silently continuing):', err);
    }
  };

  const applySuggestions = () => {
    if (!suggestions) return;
    setPages(prev => prev.map(page => {
      const suggestion = suggestions.suggestions.find((s: any) => s.index === page.index);
      if (suggestion) {
        return { ...page, rotation: suggestion.suggestedRotation };
      }
      return page;
    }));
    setSuggestions(null); // Clear after applying
  };

  const loadPDFThumbnails = async (file: File) => {
    setIsLoadingPDF(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const pageStates: PageState[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context!, viewport }).promise;
        pageStates.push({
          index: i - 1,
          rotation: page.rotate, // Initial PDF rotation
          thumbnail: canvas.toDataURL()
        });
      }
      setPages(pageStates);
      setSelectedIndices([]); // Start with nothing selected
    } catch (err) {
      console.error('PDF Load Error:', err);
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const togglePageSelection = (index: number, event: React.MouseEvent) => {
    if (event.shiftKey && lastSelectedIndex.current !== null) {
      const start = Math.min(lastSelectedIndex.current, index);
      const end = Math.max(lastSelectedIndex.current, index);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      setSelectedIndices(prev => Array.from(new Set([...prev, ...range])));
    } else {
      setSelectedIndices(prev =>
        prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
      );
      lastSelectedIndex.current = index;
    }
  };

  const rotateSelected = (dir: 'cw' | 'ccw') => {
    if (selectedIndices.length === 0) return;
    const delta = dir === 'cw' ? 90 : -90;
    setPages(prev => prev.map(p => {
      if (selectedIndices.includes(p.index)) {
        let newRot = (p.rotation + delta) % 360;
        if (newRot < 0) newRot += 360;
        return { ...p, rotation: newRot };
      }
      return p;
    }));
  };

  const handleRotateSubmit = () => {
    if (selectedFiles.length === 0) return;

    // Create granular instructions for the backend
    const instructions = pages.map(p => ({
      index: p.index,
      rotation: p.rotation
    }));

    processFiles('/pdf/rotate', [selectedFiles[0]], {
      instructions: JSON.stringify(instructions)
    });
  };

  const selectAll = () => setSelectedIndices(pages.map(p => p.index));
  const selectOdd = () => setSelectedIndices(pages.filter(p => (p.index + 1) % 2 !== 0).map(p => p.index));
  const selectEven = () => setSelectedIndices(pages.filter(p => (p.index + 1) % 2 === 0).map(p => p.index));

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
            <RotateCw size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-100 italic tracking-tight">Rotate <span className="text-emerald-400">Pro</span></h1>
            <p className="text-gray-500 text-sm">Professional orientation management with visual preview.</p>
          </div>
        </div>

        {resultUrl && (
          <button
            onClick={() => { setSelectedFiles([]); reset(); }}
            className="text-gray-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            <RotateCcw size={16} /> Start Over
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!resultUrl ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            {selectedFiles.length === 0 ? (
              <FileDropzone
                onFilesSelected={(files) => setSelectedFiles(files.slice(0, 1))}
                maxFiles={1}
                accept={{ 'application/pdf': ['.pdf'] }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Control Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="glass rounded-2xl p-6 space-y-6 sticky top-24">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Selection</label>
                      <div className="grid grid-cols-1 gap-2">
                        <SelectionButton icon={<CheckSquare size={16} />} label="All Pages" onClick={selectAll} />
                        <div className="flex gap-2">
                          <SelectionButton icon={<Layers size={16} />} label="Odd" onClick={selectOdd} className="flex-1" />
                          <SelectionButton icon={<Layers size={16} />} label="Even" onClick={selectEven} className="flex-1" />
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-gray-800" />

                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Apply Rotation</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => rotateSelected('cw')}
                          disabled={selectedIndices.length === 0}
                          className="flex-1 p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-emerald-500/50 hover:text-emerald-400 transition-all flex flex-col items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <RotateCw size={24} />
                          <span className="text-[10px] font-bold">90° CW</span>
                        </button>
                        <button
                          onClick={() => rotateSelected('ccw')}
                          disabled={selectedIndices.length === 0}
                          className="flex-1 p-4 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-teal-500/50 hover:text-teal-400 transition-all flex flex-col items-center gap-2 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <RotateCcw size={24} />
                          <span className="text-[10px] font-bold">90° CCW</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 text-center italic">
                        {selectedIndices.length} {selectedIndices.length === 1 ? 'page' : 'pages'} selected
                      </p>
                    </div>

                    <button
                      onClick={handleRotateSubmit}
                      disabled={isProcessing || isLoadingPDF}
                      className="w-full btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2 from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" /> : <><Scan size={18} /> Process Document</>}
                    </button>
                  </div>
                </div>

                {/* Preview Grid */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Auto-Fix Banner */}
                  <AnimatePresence>
                    {suggestions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                              <CheckCircle2 size={24} className="animate-pulse" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-100 italic">Smart Fix Detected</h4>
                              <p className="text-xs text-gray-500">{suggestions.suggestions.length} issues found. Correct sideways scans and mixed layouts instantly.</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={applySuggestions}
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                            >
                              <Scan size={14} />
                              Fix Orientation
                            </button>
                            <button
                              onClick={() => setSuggestions(null)}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-bold rounded-lg transition-all"
                            >
                              Ignore
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="glass rounded-2xl p-6 min-h-[600px]">
                    {isLoadingPDF ? (
                      <div className="h-[500px] flex flex-col items-center justify-center gap-4">
                        <div className="relative">
                          <Loader2 className="animate-spin text-emerald-500" size={48} />
                          <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                        </div>
                        <p className="text-gray-400 font-medium animate-pulse">Initializing Layout Engine...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pages.map((page) => (
                          <ThumbnailItem
                            key={page.index}
                            page={page}
                            isSelected={selectedIndices.includes(page.index)}
                            onClick={(e) => togglePageSelection(page.index, e)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="glass rounded-3xl p-12 text-center max-w-2xl w-full border-t-4 border-emerald-500 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <RotateCw size={200} />
              </div>

              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 size={40} className="animate-[scale-in_0.5s_ease-out]" />
              </div>

              <h2 className="text-3xl font-bold mb-2 text-white italic">Processing Complete!</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto uppercase tracking-tighter text-xs font-bold">Document orientation has been professionalized.</p>

              {/* Metrics Summary */}
              {resultData?.summary && (
                <div className="grid grid-cols-3 gap-1 mb-10 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                  <Metric label="Pages processed" value={resultData.summary.pagesProcessed} />
                  <Metric label="Pages rotated" value={resultData.summary.pagesRotated} />
                  <Metric label="Selector mode" value={resultData.summary.appliedSelection} />
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href={resultUrl}
                  download
                  className="btn-primary flex items-center gap-2 from-emerald-500 to-teal-600 px-10 py-4 shadow-xl shadow-emerald-500/10"
                >
                  Download Output
                  <Download size={20} />
                </a>
                <button
                  onClick={() => { setSelectedFiles([]); reset(); }}
                  className="px-8 py-4 bg-gray-800/80 hover:bg-gray-800 text-gray-300 rounded-xl flex items-center gap-2 transition-all border border-gray-700/50 hover:border-gray-500"
                >
                  <RotateCcw size={20} />
                  Start New Task
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isProcessing && <ProgressBar progress={progress} />}
    </div>
  )
}

function ThumbnailItem({ page, isSelected, onClick }: {
  page: PageState,
  isSelected: boolean,
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 ${isSelected
        ? "border-emerald-500 ring-4 ring-emerald-500/10 shadow-2xl shadow-emerald-500/20"
        : "border-transparent hover:border-gray-700 bg-gray-900/30"
        }`}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div
        className="aspect-[3/4] bg-white transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-inner"
        style={{ transform: `rotate(${page.rotation}deg)` }}
      >
        <img
          src={page.thumbnail}
          alt={`Page ${page.index + 1}`}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Selection Overlay */}
      <div className={`absolute inset-0 bg-emerald-500/5 transition-opacity flex items-center justify-center ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
        <div className="p-2 bg-emerald-500 text-white rounded-full shadow-lg">
          <MousePointer2 size={16} fill="white" />
        </div>
      </div>

      {/* Page Label & Angle Badge */}
      <div className="absolute bottom-2 left-2 flex gap-1 items-center">
        <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-tighter">
          P.{page.index + 1}
        </span>
        {page.rotation !== 0 && (
          <span className="px-2 py-0.5 bg-emerald-500 rounded text-[10px] font-bold text-white shadow-lg animate-in zoom-in-50">
            {page.rotation}°
          </span>
        )}
      </div>
    </motion.div>
  );
}

function SelectionButton({ icon, label, onClick, className = "" }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400 border border-gray-700 hover:border-emerald-500/30 rounded-xl text-xs font-semibold transition-all ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string, value: any }) {
  return (
    <div className="text-center px-4">
      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-lg font-bold text-emerald-400 italic tracking-tight leading-none">{value}</div>
    </div>
  );
}
