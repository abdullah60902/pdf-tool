"use client"

import React, { useState, useEffect } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { FileText, ArrowRight, Download, Loader2, RotateCcw, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressBar from '@/components/ProgressBar'

const PROCESSING_MESSAGES = [
  "Uploading to secure sandbox...",
  "Analyzing document structure...",
  "Extracting text with geometric precision...",
  "Mapping layout paths...",
  "Synthesizing DOCX structure...",
  "Finalizing document metadata..."
];

export default function PdfToWordPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [messageIndex, setMessageIndex] = useState(0)
  const { isProcessing, progress, resultUrl, resultData, error, processFiles, reset } = useFileProcessing()

  // Cycle through professional messages during processing
  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
      }, 3000);
    } else {
      setMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleConvert = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    processFiles('/pdf/pdf-to-word', selectedFiles, {}, undefined, { responseType: 'blob' });
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* SaaS Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
            <FileText size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-100 italic">PDF <span className="text-blue-500">→</span> Word</h1>
            <p className="text-gray-500 text-sm">Industrial-grade conversion with layout preservation heuristics.</p>
          </div>
        </div>
        {selectedFiles.length > 0 && !resultUrl && (
          <button
            type="button"
            onClick={() => { setSelectedFiles([]); reset(); }}
            className="text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-8">
        {!resultUrl ? (
          <>
            <AnimatePresence mode="wait">
              {selectedFiles.length === 0 ? (
                <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FileDropzone
                    onFilesSelected={setSelectedFiles}
                    maxFiles={1}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass rounded-3xl p-8 border border-white/5"
                >
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    await handleConvert(e as any);
                  }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 text-blue-400">
                          <FileText size={24} />
                        </div>
                        <div>
                          <p className="text-gray-200 font-medium truncate max-w-[200px]">{selectedFiles[0].name}</p>
                          <p className="text-xs text-gray-500">{(selectedFiles[0].size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-wider mb-1">
                          <ShieldCheck size={12} />
                          Verified Safe
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles size={12} />
                          Professional Grade
                        </div>
                      </div>
                    </div>

                    {/* Feature Checklist */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        "Multi-column support",
                        "Paragraph preservation",
                        "Smart line-break detection",
                        "Encrypted data tunnel"
                      ].map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-400 bg-white/5 p-2 rounded-lg border border-white/5">
                          <CheckCircle2 size={10} className="text-blue-500" />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="btn-primary w-full sm:w-auto flex items-center justify-center gap-3 px-16 py-4 text-lg disabled:opacity-50 disabled:scale-100 from-blue-600 to-indigo-700 shadow-blue-500/10"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            {PROCESSING_MESSAGES[messageIndex]}
                          </>
                        ) : (
                          <>
                            Begin Professional Conversion
                            <ArrowRight size={20} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Disclaimer */}
            {selectedFiles.length > 0 && (
              <p className="text-center text-[10px] text-gray-600 leading-relaxed max-w-md mx-auto italic">
                By clicking "Begin Professional Conversion", you agree to our 24-hour retention policy.
                Documents are processed in a volatile environment and never stored long-term.
              </p>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-12 text-center border-t border-white/10"
          >
            <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={48} />
            </div>

            <h2 className="text-3xl font-bold mb-3 text-gray-100">Conversion Finished</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm">
              Your document has been re-architected into editable DOCX format.
              {resultData?.metadata && (
                <span className="block mt-2 font-bold text-gray-400">
                  {resultData.metadata.pageCount} Pages • {resultData.metadata.wordCount} Words • {(resultData.metadata.fileSize / 1024).toFixed(1)} KB Produced
                </span>
              )}
              {resultData?.stats && !resultData?.metadata && (
                <span className="block mt-2 font-bold text-gray-400">
                  {resultData.stats.pages} Pages Normalized • {(resultData.stats.size / 1024).toFixed(1)} KB Produced
                </span>
              )}
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(resultUrl!);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;

                    // Extract filename from URL or use default
                    const fileName = resultUrl!.split('/').pop() || 'document.docx';
                    link.setAttribute('download', fileName);

                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Download failed:', err);
                    window.open(resultUrl!, '_blank');
                  }
                }}
                className="btn-primary flex items-center justify-center gap-2 px-10 from-blue-600 to-indigo-700"
              >
                Download DOCX
                <Download size={20} />
              </button>
              <button
                onClick={() => {
                  setSelectedFiles([])
                  reset()
                }}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5"
              >
                <RotateCcw size={20} />
                Convert New File
              </button>
            </div>
          </motion.div>
        )}

        {isProcessing && <ProgressBar progress={progress} />}
      </div>
    </div>
  )
}
