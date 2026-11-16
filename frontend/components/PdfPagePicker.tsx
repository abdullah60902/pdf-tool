import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Set up pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPagePickerProps {
  file: File;
  onSelectionChange: (selectedPages: number[]) => void;
  selectedPages: number[];
}

const PdfPagePicker: React.FC<PdfPagePickerProps> = ({ file, onSelectionChange, selectedPages }) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateThumbnails = async () => {
      try {
        setLoading(true);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const thumbs: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 }); // Small thumbnail scale

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          thumbs.push(canvas.toDataURL());
        }

        setThumbnails(thumbs);
        // Default select all if none selected
        if (selectedPages.length === 0) {
          // onSelectionChange(Array.from({ length: totalPages }, (_, i) => i + 1));
        }
      } catch (error) {
        console.error('Error generating thumbnails:', error);
      } finally {
        setLoading(false);
      }
    };

    generateThumbnails();
  }, [file]);

  const togglePage = (pageNum: number) => {
    const newSelection = selectedPages.includes(pageNum)
      ? selectedPages.filter(p => p !== pageNum)
      : [...selectedPages, pageNum].sort((a, b) => a - b);

    onSelectionChange(newSelection);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="animate-pulse">Loading PDF pages for preview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Info size={16} />
          <span>Click on pages to select/unselect for extraction</span>
        </div>
        <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest">
          {selectedPages.length} Pages Selected
        </div>
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4 bg-gray-900/40 rounded-3xl border border-white/5"
      >
        <AnimatePresence>
          {thumbnails.map((thumb, idx) => {
            const pageNum = idx + 1;
            const isSelected = selectedPages.includes(pageNum);

            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                onClick={() => togglePage(pageNum)}
                className={cn(
                  "relative cursor-pointer group rounded-xl overflow-hidden transition-all duration-300",
                  isSelected
                    ? "ring-4 ring-purple-500 shadow-2xl shadow-purple-500/40 translate-y-[-4px]"
                    : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100 ring-1 ring-white/10"
                )}
              >
                <img src={thumb} alt={`Page ${pageNum}`} className="w-full h-auto" />

                <div className={cn(
                  "absolute inset-0 flex flex-col justify-end bg-gradient-to-t transition-opacity duration-300 p-3",
                  isSelected ? "from-purple-900/80 to-transparent opacity-100" : "from-black/60 to-transparent opacity-0 group-hover:opacity-100"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-black/40 backdrop-blur-sm">
                      PAGE {pageNum}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-lg">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-sm shadow-purple-400/50" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => onSelectionChange(Array.from({ length: thumbnails.length }, (_, i) => i + 1))}
          className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
        >
          SELECT ALL
        </button>
        <button
          onClick={() => onSelectionChange([])}
          className="text-xs font-bold text-gray-500 hover:text-white transition-colors"
        >
          SELECT NONE
        </button>
      </div>
    </div>
  );
};

export default PdfPagePicker;
