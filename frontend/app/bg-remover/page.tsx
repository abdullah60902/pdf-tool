'use client'

import React, { useState, useEffect, useRef } from 'react'
import FileDropzone from '@/components/FileDropzone'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import { Eraser, Download, Loader2, RotateCcw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'
import { toast } from 'sonner'

export default function BgRemoverPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { isProcessing, progress, resultUrl, processFiles, reset } = useFileProcessing()
  const [localResultUrl, setLocalResultUrl] = useState<string | null>(null)
  const hasProcessedRef = useRef(false)

  // Sync AI result with the UI
  useEffect(() => {
    if (resultUrl) setLocalResultUrl(resultUrl)
  }, [resultUrl])

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    if (files.length > 0) {
      const url = URL.createObjectURL(files[0])
      setPreviewUrl(url)
      hasProcessedRef.current = false;
      
      // Automatic detection for solid backgrounds
      detectAndProcess(url, files);
    } else {
      setPreviewUrl(null)
    }
  }

  const detectAndProcess = (url: string, files: File[]) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Check corners slightly offset to avoid 1px border issues
      const offset = Math.min(10, Math.floor(img.width * 0.05));
      // Check more samples along the perimeter to be 100% sure it's a solid background
      const w = img.width;
      const h = img.height;
      const margin = Math.min(20, Math.floor(w * 0.05));
      
      const edgeSamples = [
        // Corners
        ctx.getImageData(margin, margin, 1, 1).data,
        ctx.getImageData(w - margin - 1, margin, 1, 1).data,
        ctx.getImageData(margin, h - margin - 1, 1, 1).data,
        ctx.getImageData(w - margin - 1, h - margin - 1, 1, 1).data,
        // Mid-edges
        ctx.getImageData(Math.floor(w/2), margin, 1, 1).data,
        ctx.getImageData(Math.floor(w/2), h - margin - 1, 1, 1).data,
        ctx.getImageData(margin, Math.floor(h/2), 1, 1).data,
        ctx.getImageData(w - margin - 1, Math.floor(h/2), 1, 1).data
      ];

      // Intelligent Uniformity Check
      const brightnesses = edgeSamples.map(p => (p[0] + p[1] + p[2]) / 3);
      const avgB = brightnesses.reduce((a, b) => a + b, 0) / brightnesses.length;
      
      // Check if all edge samples are similar to each other (within 15 units)
      const isUniform = brightnesses.every(b => Math.abs(b - avgB) < 15);

      if (isUniform && avgB > 225) {
        console.log("Verified: Solid White Background");
        toast.success("Solid White BG Detected! Applying 1100% Accuracy Mode.");
        extractLogo('white', url);
        hasProcessedRef.current = true;
      } else if (isUniform && avgB < 45) {
        console.log("Verified: Solid Black Background");
        toast.success("Solid Black BG Detected! Applying 1100% Accuracy Mode.");
        extractLogo('black', url);
        hasProcessedRef.current = true;
      } else {
        console.log("Complex Background detected, using AI...");
        if (!hasProcessedRef.current) {
           hasProcessedRef.current = true;
           triggerProcess(files);
        }
      }
    };
    img.src = url;
  }

  const triggerProcess = (files: File[]) => {
    if (files.length === 0) return
    processFiles('/bg/remove', files, {})
  }

  const handleReset = () => {
    setSelectedFiles([])
    setPreviewUrl(null)
    setLocalResultUrl(null)
    reset()
    hasProcessedRef.current = false;
  }

  // Pure Color Keying for 100% perfect Logo recovery from Black/White Backgrounds
  const extractLogo = async (bgColor: 'black' | 'white', customUrl?: string) => {
    const sourceUrl = customUrl || previewUrl;
    if (!sourceUrl) return;
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (bgColor === 'black') {
          if (brightness < 30) {
            data[i + 3] = 0;
          } else if (brightness < 60) {
             data[i + 3] = Math.max(0, (brightness - 30) * (255 / 30));
          }
        } else {
          if (brightness > 240) {
            data[i + 3] = 0;
          } else if (brightness > 200) {
             data[i + 3] = Math.max(0, (240 - brightness) * (255 / 40));
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      const exactDataUrl = canvas.toDataURL('image/png');
      setLocalResultUrl(exactDataUrl);
    };
    img.src = sourceUrl;
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20 flex-shrink-0">
          <Eraser size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">AI Background Studio</h1>
          <p className="text-gray-500 text-sm mt-1">Industrial grade 1-click background removal.</p>
        </div>
      </div>

      {selectedFiles.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-10">
          <FileDropzone
            onFilesSelected={handleFilesSelected}
            accept={{
              'image/png': ['.png'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/webp': ['.webp']
            }}
            maxFiles={1}
          />
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8 items-center max-w-4xl mx-auto w-full">
          <div className="flex-1 w-full min-w-0 space-y-4">
            
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-lg">
              <p className="text-xs text-gray-400 text-center max-w-lg mb-1 flex items-center gap-1.5 font-medium">
                <Sparkles size={14} className="text-rose-400" /> 
                100% Logo Detail Extractor (For Solid BG Only)
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                 <button onClick={() => extractLogo('black')} className="px-5 py-2.5 border border-gray-600 text-gray-300 bg-black/60 rounded-xl hover:bg-black hover:border-gray-500 flex items-center gap-2 text-sm font-semibold transition">
                    Black BG Rescue
                 </button>
                 <button onClick={() => extractLogo('white')} className="px-5 py-2.5 border border-gray-300 text-gray-800 bg-zinc-100 rounded-xl hover:bg-white hover:text-black hover:border-white flex items-center gap-2 text-sm font-semibold transition">
                    White BG Rescue
                 </button>
              </div>
            </div>

            <div className="glass rounded-3xl p-4 md:p-6 shadow-xl relative overflow-hidden flex flex-col h-[450px] md:h-[500px] xl:h-[650px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-300 flex items-center gap-2 uppercase tracking-widest text-[10px]">
                   Processing Terminal
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="p-2 bg-gray-800/50 hover:bg-rose-500/20 text-gray-300 hover:text-rose-400 rounded-lg transition-all text-sm font-medium flex items-center gap-2 border border-gray-700/50"
                  >
                    <RotateCcw size={16} /> New Image
                  </button>
                </div>
              </div>

              <div className="relative flex-1 rounded-2xl border border-gray-800 bg-gray-950 overflow-hidden flex items-center justify-center">
                {isProcessing && (
                  <div className="absolute inset-0 z-20 bg-gray-900/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Loader2 size={48} className="animate-spin text-rose-500 mb-4 shadow-rose-500 drop-shadow-lg" />
                    <p className="text-gray-200 font-medium tracking-wide">AI Processing...</p>
                    <div className="w-[200px] h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                        />
                    </div>
                  </div>
                )}
                
                {localResultUrl && previewUrl ? (
                  <BeforeAfterSlider beforeImage={previewUrl} afterImage={localResultUrl} />
                ) : (
                  previewUrl && <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                )}
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <a
                href={localResultUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                download="removed_bg_pro.png"
                onClick={(e) => (!localResultUrl || isProcessing) && e.preventDefault()}
                className={`btn-primary flex items-center gap-2 px-8 py-4 text-lg w-full justify-center transition-all ${(!localResultUrl || isProcessing) ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-[0_0_30px_rgba(244,63,94,0.3)]'}`}
              >
                <Download size={22} />
                Download HD Result
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
