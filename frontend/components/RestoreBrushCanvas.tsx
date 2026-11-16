"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pencil, Undo, Edit2, CheckCircle2, RotateCcw } from 'lucide-react';

interface RestoreBrushCanvasProps {
  originalImage: string;
  processedImage: string;
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function RestoreBrushCanvas({ originalImage, processedImage, onSave, onCancel }: RestoreBrushCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [mode, setMode] = useState<'restore' | 'erase'>('restore');
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    // Load Images
    const imgOriginal = new Image();
    const imgProcessed = new Image();
    imgOriginal.crossOrigin = 'anonymous';
    imgProcessed.crossOrigin = 'anonymous';

    const loadImages = async () => {
      await new Promise(r => { imgOriginal.onload = r; imgOriginal.src = originalImage; });
      await new Promise(r => { imgProcessed.onload = r; imgProcessed.src = processedImage; });

      initCanvas(imgOriginal, imgProcessed);
    };
    loadImages();
  }, [originalImage, processedImage]);

  const initCanvas = (original: HTMLImageElement, processed: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use processed image dimensions
    canvas.width = processed.width;
    canvas.height = processed.height;

    // Draw processed image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(processed, 0, 0);

    // Save initial state to history
    saveHistoryState(canvas, ctx);

    // Create offscreen canvas for original image
    const offCanvas = document.createElement('canvas');
    offCanvas.width = original.width;
    offCanvas.height = original.height;
    const offCtx = offCanvas.getContext('2d');
    offCtx?.drawImage(original, 0, 0);
    originalCanvasRef.current = offCanvas;
  };

  const saveHistoryState = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => [...prev, imageData]);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaling because canvas CSS visual size might differ from actual pixel width/height
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    setLastPos(coords);
    draw(coords.x, coords.y, coords.x, coords.y);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setLastPos(null);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) saveHistoryState(canvasRef.current, ctx);
    }
  };

  const handleDrawMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPos) return;
    const coords = getCoordinates(e);
    if (!coords) return;
    draw(lastPos.x, lastPos.y, coords.x, coords.y);
    setLastPos(coords);
  };

  const draw = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = canvasRef.current;
    const original = originalCanvasRef.current;
    if (!canvas || !original) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else if (mode === 'restore') {
      // Magic Restore Technique (Clipping original image to brush path)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke(); // Draw the stroke path used for clipping bounds
      ctx.clip();
      
      // We draw the original image over the clipped area
      ctx.drawImage(original, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previousState = newHistory[newHistory.length - 1];
    
    ctx.putImageData(previousState, 0, 0);
    setHistory(newHistory);
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 rounded-2xl overflow-hidden border border-gray-800">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3 bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button 
            onClick={() => setMode('restore')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'restore' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Pencil size={16} /> Restore
          </button>
          <button 
            onClick={() => setMode('erase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'erase' ? 'bg-rose-500/20 text-rose-400' : 'text-gray-400 hover:text-white'}`}
          >
            <Eraser size={16} /> Erase
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm font-medium">
            <span className="text-xs uppercase tracking-wider">Size:</span>
            <input 
              type="range" min="5" max="100" 
              value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24 accent-gray-400"
            />
          </div>
          <button onClick={handleUndo} disabled={history.length <= 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition">
            <Undo size={18} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-[repeating-conic-gradient(#1a1a2e_0%_25%,#16162a_0%_50%)] bg-[length:20px_20px] flex items-center justify-center p-4 cursor-crosshair min-h-[400px]"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={handleDrawMove}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={handleDrawMove}
          className="max-w-full max-h-full object-contain shadow-2xl rounded"
          style={{ width: 'auto', height: '100%' }}
        />
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition">
          Cancel
        </button>
        <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-rose-500/20">
          <CheckCircle2 size={16} /> Apply Magic
        </button>
      </div>

    </div>
  );
}
