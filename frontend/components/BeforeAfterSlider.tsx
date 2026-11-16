import React, { useState, useRef, useEffect, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const position = ((clientX - left) / width) * 100;
    setSliderPosition(Math.min(Math.max(position, 0), 100));
  }, []);

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
      const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
      
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMove]);

  return (
    <div 
      className="relative w-full h-full overflow-hidden cursor-ew-resize select-none"
      ref={containerRef}
      onMouseDown={(e) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Background (After) Image - Transparent Output */}
      <div className="absolute inset-0 bg-[repeating-conic-gradient(#1a1a2e_0%_25%,#16162a_0%_50%)] bg-[length:20px_20px]">
        <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      </div>

      {/* Foreground (Before) Image - Clipped */}
      <div 
        className="absolute inset-0 bg-gray-900 border-r-2 border-cyan-500 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)] z-10 hidden md:block"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 absolute">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
      
      <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm pointer-events-none z-10 shadow-xl">Original</div>
      <div className="absolute top-4 right-4 bg-rose-500/80 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm pointer-events-none z-10 shadow-xl border border-rose-400">Processed</div>
    </div>
  );
}
