"use client"

import React, { useState, useEffect, useRef, useMemo } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { Trash2, ArrowRight, Download, Loader2, RotateCcw, Info, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'
import * as pdfjs from 'pdfjs-dist'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PageState {
  index: number;
  thumbnail: string;
}

export default function DeletePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [pagesToDeleteStr, setPagesToDeleteStr] = useState('')
  const [pages, setPages] = useState<PageState[]>([])
  const [isLoadingPDF, setIsLoadingPDF] = useState(false)
  const { isProcessing, progress, resultUrl, processFiles, reset } = useFileProcessing()

  // Load PDF Thumbnails
  useEffect(() => {
    if (selectedFiles.length > 0) {
      loadPDFThumbnails(selectedFiles[0]);
    } else {
      setPages([]);
      setPagesToDeleteStr('');
    }
  }, [selectedFiles]);

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
          thumbnail: canvas.toDataURL(),
        });
      }
      setPages(pageStates);
    } catch (err) {
      console.error('Failed to load PDF thumbnails:', err);
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // Logic: Parse range string to indices
  const selectedIndices = useMemo(() => {
    if (!pagesToDeleteStr) return [];
    const indices = new Set<number>();
    const parts = pagesToDeleteStr.split(',').map(p => p.trim());

    parts.forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
          for (let i = start; i <= Math.min(end, pages.length); i++) {
            indices.add(i - 1);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num > 0 && num <= pages.length) {
          indices.add(num - 1);
        }
      }
    });

    return Array.from(indices).sort((a, b) => a - b);
  }, [pagesToDeleteStr, pages.length]);

  // Logic: Click thumbnail to toggle
  const togglePageSelection = (index: number) => {
    const isSelected = selectedIndices.includes(index);
    let newIndices: number[];

    if (isSelected) {
      newIndices = selectedIndices.filter(i => i !== index);
    } else {
      newIndices = [...selectedIndices, index].sort((a, b) => a - b);
    }

    // Convert back to string representation
    setPagesToDeleteStr(indicesToRangeString(newIndices));
  };

  const indicesToRangeString = (indices: number[]) => {
    if (indices.length === 0) return '';
    const sorted = [...indices].sort((a, b) => a - b).map(i => i + 1);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  };

  const handleDelete = () => {
    if (selectedFiles.length === 0 || selectedIndices.length === 0) return
    processFiles('/pdf/delete-pages', selectedFiles, { pagesToDelete: pagesToDeleteStr })
  }

  const isAllPagesSelected = selectedIndices.length === pages.length && pages.length > 0;

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-rose-500/20">
            <Trash2 size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Delete PDF Pages</h1>
            <p className="text-gray-500 text-sm">Professional page removal system with visual confirmation.</p>
          </div>
        </div>
        {selectedFiles.length > 0 && !resultUrl && (
          <button
            onClick={() => { setSelectedFiles([]); reset(); }}
            className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2 text-sm"
          >
            <RotateCcw size={16} />
            Change File
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {!resultUrl ? (
            <>
              {selectedFiles.length === 0 ? (
                <FileDropzone
                  onFilesSelected={(files) => setSelectedFiles(files.slice(0, 1))}
                  maxFiles={1}
                />
              ) : (
                <div className="glass rounded-3xl p-6 min-h-[600px]">
                  {isLoadingPDF ? (
                    <div className="h-[500px] flex flex-col items-center justify-center gap-4 text-gray-500">
                      <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                      <p className="text-lg animate-pulse">Generating page thumbnails...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                      <AnimatePresence mode="popLayout">
                        {pages.map((page) => (
                          <motion.div
                            key={page.index}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -4 }}
                            onClick={() => togglePageSelection(page.index)}
                            className={cn(
                              "relative group cursor-pointer aspect-[1/1.4] rounded-xl overflow-hidden border-2 transition-all duration-300",
                              selectedIndices.includes(page.index)
                                ? "border-red-500 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
                                : "border-gray-800 hover:border-gray-700"
                            )}
                          >
                            <img
                              src={page.thumbnail}
                              alt={`Page ${page.index + 1}`}
                              className={cn(
                                "w-full h-full object-cover transition-all duration-300",
                                selectedIndices.includes(page.index) && "opacity-40 grayscale"
                              )}
                            />

                            {/* Overlay */}
                            <div className={cn(
                              "absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300",
                              selectedIndices.includes(page.index) ? "opacity-100" : "opacity-0"
                            )}>
                              <div className="bg-red-500/20 text-red-500 p-3 rounded-full backdrop-blur-md border border-red-500/30">
                                <Trash2 size={24} />
                              </div>
                              <span className="text-[10px] font-bold text-red-500 uppercase mt-2 tracking-widest">Marked for Deletion</span>
                            </div>

                            {/* Page Number Badge */}
                            <div className={cn(
                              "absolute bottom-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold backdrop-blur-md transition-colors",
                              selectedIndices.includes(page.index)
                                ? "bg-red-500 text-white"
                                : "bg-gray-900/80 text-gray-400 group-hover:text-gray-200"
                            )}>
                              PAGE {page.index + 1}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold mb-2">Operation Successful!</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Selected pages have been permanently removed. Your new document is ready.</p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 px-10 from-red-500 to-rose-600"
                >
                  Download Result
                  <Download size={20} />
                </a>
                <button
                  onClick={() => { setSelectedFiles([]); reset(); }}
                  className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <RotateCcw size={20} />
                  Start New Project
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Control Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 sticky top-8 border-t border-white/5 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
              <Trash2 size={20} className="text-red-500" />
              Deletion Controls
            </h3>

            {/* Range Input */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Page Selection String</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={pagesToDeleteStr}
                    onChange={(e) => setPagesToDeleteStr(e.target.value)}
                    placeholder="e.g. 1, 3, 5-7"
                    disabled={pages.length === 0}
                    className="w-full bg-black/40 border border-gray-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-red-500 transition-all placeholder:text-gray-700"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-red-500/50 transition-colors">
                    <Info size={16} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mt-2 px-1 italic">Click thumbnails to toggle selection automatically.</p>
              </div>

              {/* Summary Panel */}
              <AnimatePresence>
                {selectedIndices.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Pages to remove:</span>
                      <span className="text-xs font-bold text-red-500">{selectedIndices.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Pages remaining:</span>
                      <span className="text-xs font-bold text-gray-200">{pages.length - selectedIndices.length}</span>
                    </div>

                    {isAllPagesSelected && (
                      <div className="bg-red-500 p-2 rounded-lg flex items-center gap-2">
                        <AlertCircle size={14} className="text-white shrink-0" />
                        <span className="text-[10px] font-black leading-tight text-white uppercase">Fatal Error: Cannot delete all pages</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-red-500/10">
                      <p className="text-[10px] leading-relaxed text-gray-500 italic">
                        "You are about to permanently delete pages: {indicesToRangeString(selectedIndices)} ({selectedIndices.length} pages)"
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              disabled={selectedFiles.length === 0 || selectedIndices.length === 0 || isProcessing || isAllPagesSelected}
              onClick={handleDelete}
              className="w-full btn-primary py-4 text-sm font-bold flex items-center justify-center gap-2 group transition-all disabled:opacity-30 disabled:grayscale from-red-500 to-rose-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Cleaning PDF...
                </>
              ) : (
                <>
                  Perform Deletion
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-gray-600 mt-4 leading-relaxed uppercase tracking-tighter">
              This action is irreversible.<br />A backup of the original will not be kept.
            </p>
          </div>
        </div>
      </div>

      {isProcessing && <ProgressBar progress={progress} />}
    </div>
  )
}
