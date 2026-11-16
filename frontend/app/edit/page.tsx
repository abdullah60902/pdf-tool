"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useFileProcessing } from '@/hooks/useFileProcessing'
import FileDropzone from '@/components/FileDropzone'
import { Edit3, Type, Image as ImageIcon, Save, Download, Move, X, Loader2, Plus, Minus, Pen, Highlighter, Eraser, MousePointer2, TextSelect, Undo, Redo } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist';
import { fabric } from 'fabric';

// Use local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'draw' | 'rect';
  x: number | string; // Allow 'center'
  y: number;
  pageIndex: number;
  text?: string;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  opacity?: number;
  imageData?: string;
  scale?: number;
  pathData?: string;
  angle?: number;
  flipX?: boolean;
  flipY?: boolean;
  zAction?: 'forward' | 'backward' | null;
}

export default function EditPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)

  const [tool, setTool] = useState<'select' | 'text' | 'image' | 'pen' | 'highlighter' | 'eraser' | 'edit-text'>('select')

  // History Management
  const [elements, setElements] = useState<EditorElement[]>([])
  const [history, setHistory] = useState<EditorElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Helper to update state and push to history
  const setElementsWithHistory = (newElementsOrUpdater: EditorElement[] | ((prev: EditorElement[]) => EditorElement[])) => {
    setElements(prev => {
      const next = typeof newElementsOrUpdater === 'function' ? newElementsOrUpdater(prev) : newElementsOrUpdater;

      // If state hasn't actually changed, don't clutter history (optional optimization)
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(next);
      if (newHistory.length > 50) newHistory.shift(); // Limit to 50 steps

      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      return next;
    });
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setElements(history[prevIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setElements(history[nextIndex]);
    }
  }, [history, historyIndex]);


  // General Hotkeys
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (document.activeElement as any)?.isContentEditable) return;

      switch (e.key.toLowerCase()) {
        case 'v': setTool('select'); break;
        case 't': setTool('edit-text'); break;
        case 'p': setTool('pen'); break;
        case 'e': setTool('eraser'); break;
        case 'z': if (e.ctrlKey || e.metaKey) undo(); break;
        case 'y': if (e.ctrlKey || e.metaKey) redo(); break;
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [undo, redo]);

  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(2)
  const [textSize, setTextSize] = useState(16)

  const { isProcessing, resultUrl, processFiles } = useFileProcessing()

  useEffect(() => {
    if (!selectedFile) return;
    const loadPdf = async () => {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
    };
    loadPdf();
  }, [selectedFile]);

  const addElement = (el: Omit<EditorElement, 'id'>) => {
    const id = Date.now().toString() + Math.random();
    setElementsWithHistory(prev => [...prev, { ...el, id }]);
    setSelectedElementId(id);
  };

  const addElements = (els: Omit<EditorElement, 'id'>[]) => {
    const newEls = els.map(el => ({ ...el, id: Date.now().toString() + Math.random() + Math.random() }));
    setElementsWithHistory(prev => [...prev, ...newEls]);
    if (newEls.length > 0) setSelectedElementId(newEls[newEls.length - 1].id);
  };

  const updateElement = (id: string, updates: Partial<EditorElement>) => {
    setElementsWithHistory(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  // Separate update for dragging to avoid history spam? 
  // For now, dragging updates history on every move end? 
  // No, DraggableElement updates on every move... this will spam history!
  // FIX: Separate 'active drag' state vs 'committed' state.
  // Current implementation updates 'elements' on drag. This is bad for history.
  // Actually, updateElement is called on drag move.
  // I need to change DraggableElement to only call onUpdate (which calls updateElement) on drag END.
  // Or: updateElement implementation for direct interaction vs committed history.

  // Let's modify updateElement to accept a 'skipHistory' flag?
  // Or DraggableElement should manage local state and commit on pointerUp.

  // I will refactor DraggableElement to use local state for dragging and only sync to parent on move end.
  // Wait, DraggableElement relies on parent state for rendering position?
  // Yes. If I use local state, the UI will update smoothly. 
  // Let's implement local drag state in DraggableElement.

  const removeElement = (id: string) => {
    setElementsWithHistory(prev => prev.filter(el => el.id !== id));
  };

  const handleSave = async () => {
    if (!selectedFile || !pdfDoc) return;
    const operations = await Promise.all(elements.map(async (el) => {
      const page = await pdfDoc.getPage(el.pageIndex + 1);
      const viewport = page.getViewport({ scale: scale });
      const pdfViewport = page.getViewport({ scale: 1.0 });
      const ratio = pdfViewport.width / viewport.width;

      return {
        ...el,
        x: (Number(el.x) || 0) * ratio,
        y: el.y * ratio,
        width: (el.width || 0) * ratio,
        height: (el.height || 0) * ratio,
        strokeWidth: (el.strokeWidth || 1) * ratio,
        size: el.fontSize,
      };
    }));
    processFiles('/pdf/edit', [selectedFile], { operations: JSON.stringify(operations) });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col h-screen overflow-hidden">
      <div className="bg-gray-900/60 backdrop-blur-xl border-b border-gray-800/50 p-3 flex items-center justify-between shadow-2xl z-40 relative">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 pr-6 border-r border-gray-800/50">
            <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
              <Edit3 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic leading-none">Antigravity</h1>
              <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest">Editor Pro</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-950/50 p-1 rounded-xl border border-gray-800/50 mr-4">
              <ToolButton onClick={undo} icon={Undo} title="Undo (Ctrl+Z)" disabled={historyIndex <= 0} />
              <ToolButton onClick={redo} icon={Redo} title="Redo (Ctrl+Y)" disabled={historyIndex >= history.length - 1} />
            </div>

            <nav className="flex items-center gap-1 bg-gray-950/50 p-1 rounded-xl border border-gray-800/50">
              <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} title="Select (V)" />
              <ToolButton active={tool === 'edit-text'} onClick={() => setTool('edit-text')} icon={TextSelect} title="Magic Edit (T)" />
              <div className="w-px h-4 bg-gray-800 mx-1"></div>
              <ToolButton active={tool === 'text'} onClick={() => { setTool('text'); setColor('#000000'); }} icon={Type} title="Text" />
              <ToolButton active={tool === 'image'} onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                      addElement({ type: 'image', x: 200, y: 200, pageIndex: 0, imageData: re.target?.result as string, scale: 0.6 });
                    };
                    reader.readAsDataURL(file);
                  }
                };
                input.click();
              }} icon={ImageIcon} title="Image" />
              <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={Eraser} title="Whiteout (E)" />
              <div className="w-px h-4 bg-gray-800 mx-1"></div>
              <ToolButton active={tool === 'pen'} onClick={() => { setTool('pen'); setColor('#be185d'); setBrushSize(2); }} icon={Pen} title="Draw (P)" />
              <ToolButton active={tool === 'highlighter'} onClick={() => { setTool('highlighter'); setBrushSize(18); }} icon={Highlighter} title="Highlight" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-gray-950/50 rounded-xl border border-gray-800/50 animate-in fade-in slide-in-from-left-2 transition-all">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded-md cursor-pointer border-none bg-transparent hover:scale-110 transition-transform" />
              <div className="w-px h-4 bg-gray-800"></div>
              {(tool === 'pen' || tool === 'highlighter') && (
                <select value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="bg-transparent border-none text-[10px] font-bold uppercase tracking-wider text-gray-400 outline-none cursor-pointer">
                  <option value="2">Thin</option>
                  <option value="8">Medium</option>
                  <option value="24">Heavy</option>
                </select>
              )}
              {(tool === 'text' || tool === 'edit-text') && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500">PX</span>
                  <input type="number" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-8 bg-transparent border-none text-[10px] font-mono text-center outline-none" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {selectedFile && !resultUrl && (
            <button onClick={handleSave} disabled={isProcessing} className="bg-pink-600 hover:bg-pink-500 text-white flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-pink-600/20 transition-all active:scale-95 disabled:opacity-50">
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isProcessing ? 'Processing...' : 'Export PDF'}
            </button>
          )}
          {resultUrl && (
            <a href={resultUrl} className="bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95 animate-bounce">
              <Download size={16} /> Download
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-900/50 backdrop-blur-sm p-8 flex flex-col items-center gap-8 custom-scrollbar">
        {!selectedFile ? (
          <div className="flex-1 flex items-center justify-center w-full max-w-xl">
            <FileDropzone onFilesSelected={(files) => setSelectedFile(files[0])} maxFiles={1} />
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-20 w-fit">
            <div className="fixed bottom-4 right-4 bg-gray-800 p-2 rounded-full shadow-2xl border border-gray-700 flex gap-2 z-50">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-2 hover:bg-gray-700 rounded-full"><Minus size={16} /></button>
              <span className="text-xs self-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-2 hover:bg-gray-700 rounded-full"><Plus size={16} /></button>
            </div>

            {pdfDoc && Array.from({ length: totalPages }, (_, i) => (
              <PageCanvas
                key={i}
                pageIndex={i}
                pdfDoc={pdfDoc}
                scale={scale}
                tool={tool}
                color={color}
                brushSize={brushSize}
                textSize={textSize}
                elements={elements.filter(e => e.pageIndex === i)}
                selectedElementId={selectedElementId}
                onAddElement={(el: any) => addElement({ ...el, pageIndex: i })}
                onAddElements={(els: any[]) => addElements(els.map(el => ({ ...el, pageIndex: i })))}
                onUpdateElementHistory={(id: string, updates: any) => updateElement(id, updates)}
                onUpdateElementLive={(id: string, updates: any) => {
                  setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
                }}
                onRemoveElement={removeElement}
                onSelectElement={setSelectedElementId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contextual Properties Panel */}
      {selectedElementId && elements.find(el => el.id === selectedElementId) && (
        <PropertiesPanel
          element={elements.find(el => el.id === selectedElementId)!}
          onUpdate={(updates) => updateElement(selectedElementId, updates)}
          onClose={() => setSelectedElementId(null)}
        />
      )}

      <footer className="bg-gray-950 border-t border-gray-900 p-2.5 px-6 flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] z-50">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">File:</span>
            <span className="text-gray-300 truncate max-w-xs">{selectedFile?.name || 'Waiting...'}</span>
          </div>
          <div className="w-px h-3 bg-gray-800"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Format:</span>
            <span className="text-gray-300">PDF Document ({totalPages} Pgs)</span>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
            <span className="text-pink-500/80">Syncing Engine Active</span>
          </div>
          <div className="w-px h-3 bg-gray-800"></div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Assets:</span>
            <span className="text-gray-300">{elements.length} Objects</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function PropertiesPanel({ element, onUpdate, onClose }: { element: EditorElement, onUpdate: (u: any) => void, onClose: () => void }) {
  return (
    <div className="fixed top-20 right-8 w-64 bg-gray-900/90 backdrop-blur-md border border-gray-700 shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Properties</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={14} /></button>
      </div>

      <div className="space-y-4">
        {(element.type === 'text' || element.type === 'rect') && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.color || element.fill || '#000000'}
                onChange={(e) => onUpdate(element.type === 'text' ? { color: e.target.value } : { fill: e.target.value })}
                className="w-10 h-10 rounded-lg cursor-pointer bg-gray-800 border-none p-1"
              />
              <span className="text-xs font-mono text-gray-300 uppercase">{element.color || element.fill || '#000000'}</span>
            </div>
          </div>
        )}

        {element.type === 'text' && (
          <div>
            <label className="text-[10px] text-gray-400 block mb-1">Font Size</label>
            <div className="flex items-center gap-2">
              <input
                type="range" min="8" max="72"
                value={element.fontSize || 16}
                onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                className="flex-1 accent-pink-600"
              />
              <span className="text-xs w-6 text-right font-mono">{element.fontSize}</span>
            </div>
          </div>
        )}

        <div>
          <label className="text-[10px] text-gray-400 block mb-1">Opacity</label>
          <input
            type="range" min="0.1" max="1" step="0.1"
            value={element.opacity || 1}
            onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
            className="w-full accent-pink-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => onUpdate({ angle: (element.angle || 0) + 90 })}
            className="bg-gray-800 hover:bg-gray-700 text-[10px] py-2 rounded-lg transition-colors border border-gray-700"
          >
            Rotate 90°
          </button>
          <button
            onClick={() => {
              // We'll pass a special command that PageCanvas handles or just calculate here
              // Calculating here is hard because we don't know page width.
              // So we pass 'center' and PageCanvas handles it, but we MUST fix the type.
              onUpdate({ x: 'center' });
            }}
            className="bg-gray-800 hover:bg-gray-700 text-[10px] py-2 rounded-lg transition-colors border border-gray-700"
          >
            Center H
          </button>
        </div>

        <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
          <button onClick={() => onUpdate({ zAction: 'forward' })} className="flex-1 bg-gray-800 hover:bg-gray-700 text-[9px] py-1.5 rounded border border-gray-700 uppercase font-bold tracking-tighter">Bring Forward</button>
          <button onClick={() => onUpdate({ zAction: 'backward' })} className="flex-1 bg-gray-800 hover:bg-gray-700 text-[9px] py-1.5 rounded border border-gray-700 uppercase font-bold tracking-tighter">Send Back</button>
        </div>
      </div>
    </div>
  )
}

function PageCanvas({
  pageIndex, pdfDoc, scale, tool, color, brushSize, textSize, elements, selectedElementId,
  onAddElement, onAddElements, onUpdateElementHistory, onUpdateElementLive, onRemoveElement, onSelectElement
}: any) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fCanvasRef = useRef<fabric.Canvas | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [loaded, setLoaded] = useState(false);
  const [textItems, setTextItems] = useState<any[]>([]);

  // 1. Initialize Fabric Canvas ONCE
  useEffect(() => {
    if (!canvasRef.current) return;

    // 0. Setup Custom Delete Control for Fabric
    const deleteIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='18' y1='6' x2='6' y2='18'%3E%3C/line%3E%3Cline x1='6' y1='6' x2='18' y2='18'%3E%3C/line%3E%3C/svg%3E";
    const delImg = document.createElement('img');
    delImg.src = deleteIcon;

    function renderDeleteIcon(ctx: CanvasRenderingContext2D, left: number, top: number, styleOverride: any, fabricObject: fabric.Object) {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle || 0));
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#ef4444'; // Modern Red
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.drawImage(delImg, -size / 4, -size / 4, size / 2, size / 2);
      ctx.restore();
    }

    fabric.Object.prototype.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: -12,
      offsetX: 12,
      cursorStyle: 'pointer',
      mouseUpHandler: (eventData, transform) => {
        const target = transform.target;
        if (target.data?.id) {
          onRemoveElement(target.data.id);
        }
        return true;
      },
      render: renderDeleteIcon,
    });

    const fc = new fabric.Canvas(canvasRef.current, {
      preserveObjectStacking: true,
      stopContextMenu: true,
      fireRightClick: true,
    });
    fCanvasRef.current = fc;

    // Handle object modification (Move/Scale/Rotate)
    fc.on('object:modified', (e) => {
      const obj = e.target;
      if (!obj || !obj.data?.id) return;

      onUpdateElementHistory(obj.data.id, {
        x: obj.left,
        y: obj.top,
        width: obj.getScaledWidth(),
        height: obj.getScaledHeight(),
        angle: obj.angle,
        scale: obj.scaleX,
        text: (obj as any).text,
      });
    });

    fc.on('text:changed', (e: any) => {
      const obj = e.target;
      if (!obj || !obj.data?.id) return;
      // Live sync for text changes to avoid losing data
      onUpdateElementLive(obj.data.id, { text: obj.text });
    });

    fc.on('editing:exited', (e: any) => {
      const obj = e.target;
      if (!obj || !obj.data?.id) return;
      onUpdateElementHistory(obj.data.id, { text: obj.text });
    });

    // Handle Drawing Persistence
    fc.on('path:created', (options: any) => {
      const path = options.path;
      if (!path || !path.path) return;

      const id = 'draw-' + Math.random().toString(36).substr(2, 9);

      onAddElement({
        id,
        type: 'draw',
        x: path.left,
        y: path.top,
        pathData: path.path.map((p: any) => p.join(' ')).join(' '),
        stroke: path.stroke,
        strokeWidth: path.strokeWidth,
        opacity: path.opacity,
        pageIndex
      });
      fc.remove(path);
    });

    // Handle mouse down for adding new elements
    fc.on('mouse:down', (options) => {
      // Logic handled via shared tool state now for better consistency
      if (options.target) return; // Don't add if clicking an existing object
    });

    // Track selection for UI - Only notify if definitely changed
    fc.on('selection:created', (e) => {
      const id = e.target?.data?.id;
      if (id && id !== selectedElementId) onSelectElement(id);
    });
    fc.on('selection:updated', (e) => {
      const id = e.target?.data?.id;
      if (id && id !== selectedElementId) onSelectElement(id);
    });
    fc.on('selection:cleared', () => {
      // Clear ONLY if we are truly deselecting.
      // 3b Global Sync effect handles the nulling logic safely.
    });

    // Keyboard Delete
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = fc.getActiveObject();
      // IF currently editing text, DON'T intercept backspace/delete
      if (activeObject && (activeObject as any).isEditing) return;

      if (document.activeElement?.tagName === 'INPUT' || (document.activeElement as any)?.isContentEditable) return;

      if (e.key === 'Delete' || (e.key === 'Backspace' && tool === 'select')) {
        const activeObjects = fc.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach(obj => {
            if (obj.data?.id) onRemoveElement(obj.data.id);
          });
          fc.discardActiveObject().requestRenderAll();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      fc.dispose();
      fCanvasRef.current = null;
    };
  }, []); // EMPTY DEP: Only init once

  // 2. Reactively Add Elements (Mouse Handler)
  useEffect(() => {
    const fc = fCanvasRef.current;
    if (!fc) return;

    const handleMouseDown = (options: fabric.IEvent) => {
      if (fc.getActiveObject() || fc.isDrawingMode) return;

      const pointer = fc.getPointer(options.e);
      const { x, y } = pointer;

      if (tool === 'text') {
        onAddElement({
          type: 'text',
          x,
          y: y - (textSize / 2),
          text: 'New Text',
          fontSize: textSize,
          color,
          pageIndex
        });
      } else if (tool === 'eraser') {
        onAddElement({
          type: 'rect',
          x,
          y: y - 10,
          width: 60,
          height: 30,
          fill: '#FFFFFF',
          opacity: 1,
          pageIndex
        });
      }
    };

    fc.on('mouse:down', handleMouseDown);
    return () => { fc.off('mouse:down', handleMouseDown); };
  }, [tool, color, textSize]);

  // 3. Sync Tool State to Fabric
  useEffect(() => {
    const fc = fCanvasRef.current;
    if (!fc) return;

    fc.selection = tool === 'select';
    fc.isDrawingMode = tool === 'pen' || tool === 'highlighter';
    fc.defaultCursor = tool === 'select' ? 'default' : 'crosshair';

    if (fc.isDrawingMode) {
      const brush = new fabric.PencilBrush(fc);
      brush.width = brushSize;

      const baseColor = tool === 'highlighter' && color === '#000000' ? '#fde047' : color;
      brush.color = tool === 'highlighter' ? hexToRgba(baseColor, 0.4) : baseColor;

      fc.freeDrawingBrush = brush;
    }

    fc.forEachObject(obj => {
      // Background shouldn't be selectable
      if (obj.data?.isBackground) {
        obj.selectable = false;
        obj.evented = false;
        return;
      }
      obj.selectable = tool === 'select' || tool === 'edit-text';
      obj.evented = tool === 'select' || tool === 'edit-text';
      // Enable text editing if tool is edit-text or select
      if (obj.type === 'i-text') {
        (obj as fabric.IText).editable = tool === 'select' || tool === 'edit-text';
      }
    });

    fc.requestRenderAll();
  }, [tool, color, brushSize]);


  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // 4. Multi-Sync Elements to Fabric
  useEffect(() => {
    const fc = fCanvasRef.current;
    if (!fc || !loaded) return;

    // Track active IDs to remove others
    const activeIds = new Set(elements.map((e: any) => e.id));
    const currentFabricObjects = new Map<string, fabric.Object>();

    fc.forEachObject(obj => {
      if (obj.data?.id) currentFabricObjects.set(obj.data.id, obj);
    });

    elements.forEach((el: any) => {
      let obj = currentFabricObjects.get(el.id);

      if (obj) {
        // Handle special transient commands (center/z-index)
        if (el.x === 'center') {
          obj.centerH().setCoords();
          onUpdateElementLive(el.id, { x: obj.left });
        } else if (el.zAction) {
          if (el.zAction === 'forward') obj.bringForward();
          else obj.sendBackwards();
          onUpdateElementLive(el.id, { zAction: null });
        } else {
          // Sync basic props if they differ
          if (Math.abs(obj.left! - Number(el.x)) > 1 || Math.abs(obj.top! - Number(el.y)) > 1) {
            obj.set({ left: Number(el.x), top: Number(el.y) });
          }
          if (obj.angle !== (el.angle || 0)) obj.set('angle', el.angle);
          if (obj.opacity !== (el.opacity ?? 1)) obj.set('opacity', el.opacity);

          if (obj.type === 'i-text') {
            const itext = obj as fabric.IText;
            if (itext.fontSize !== el.fontSize) itext.set('fontSize', el.fontSize);
            if (itext.fill !== el.color) itext.set('fill', el.color);
            if (itext.text !== el.text) itext.set('text', el.text);
          } else if (obj.type === 'rect') {
            if ((obj as fabric.Rect).fill !== el.fill) obj.set('fill', el.fill);
          }

          obj.setCoords();
        }
      } else {
        // New Object Creation
        if (el.type === 'text') {
          obj = new fabric.IText(el.text || '', {
            left: Number(el.x), top: Number(el.y),
            fontSize: el.fontSize, fill: el.color,
            fontFamily: 'Arial', data: { id: el.id },
            selectable: true,
          });

          // Selection handled by 3b hook
        } else if (el.type === 'rect') {
          obj = new fabric.Rect({
            left: Number(el.x), top: Number(el.y),
            width: el.width, height: el.height,
            fill: el.fill, opacity: el.opacity,
            data: { id: el.id }
          });
        } else if (el.type === 'draw') {
          // Reconstruct path from pathData
          obj = new fabric.Path(el.pathData, {
            left: el.x, top: el.y,
            stroke: el.stroke, strokeWidth: el.strokeWidth,
            fill: 'transparent', opacity: el.opacity,
            data: { id: el.id }
          });
        } else if (el.type === 'image' && el.imageData) {
          fabric.Image.fromURL(el.imageData, (img) => {
            img.set({
              left: Number(el.x), top: Number(el.y),
              scaleX: el.scale || 1, scaleY: el.scale || 1,
              data: { id: el.id }
            });
            fc.add(img);
            img.setCoords();
          });
        }

        if (obj && el.type !== 'image') {
          fc.add(obj);
          obj.setCoords();
        }
      }
    });

    // Final Cleanup: Remove objects not in 'elements'
    fc.forEachObject(obj => {
      if (obj.data?.id && !activeIds.has(obj.data.id)) {
        fc.remove(obj);
      }
    });

    fc.requestRenderAll();
  }, [elements, loaded]);

  // 3b. Global Selection Sync (Moved here to run AFTER element creation)
  useEffect(() => {
    const fc = fCanvasRef.current;
    if (!fc || !loaded) return;

    const activeObj = fc.getActiveObject();
    const activeId = activeObj?.data?.id;

    if (!selectedElementId) {
      if (activeObj) fc.discardActiveObject().requestRenderAll();
      return;
    }

    const belongsToThisPage = elements.find((e: any) => e.id === selectedElementId);
    if (belongsToThisPage) {
      if (activeId !== selectedElementId) {
        const targetObj = fc.getObjects().find(o => o.data?.id === selectedElementId);
        if (targetObj) {
          fc.setActiveObject(targetObj).requestRenderAll();
          if (tool === 'edit-text' && targetObj.type === 'i-text') {
            (targetObj as fabric.IText).enterEditing();
            (targetObj as fabric.IText).selectAll();
            fc.requestRenderAll();
          }
        }
      }
    } else if (activeId) {
      fc.discardActiveObject().requestRenderAll();
    }
  }, [selectedElementId, elements, loaded, tool]);

  // 5. PDF Render as Background
  useEffect(() => {
    if (!pdfDoc) return;
    const renderPage = async () => {
      if (renderTaskRef.current) try { await renderTaskRef.current.cancel(); } catch (e) { }

      const page = await pdfDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = viewport.width;
      tempCanvas.height = viewport.height;
      const context = tempCanvas.getContext('2d');
      if (!context) return;

      const renderTask = page.render({ canvasContext: context, viewport });
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
        setLoaded(true);

        const fc = fCanvasRef.current;
        if (fc) {
          fc.setDimensions({ width: viewport.width, height: viewport.height });
          fabric.Image.fromURL(tempCanvas.toDataURL(), (img) => {
            img.data = { isBackground: true };
            fc.setBackgroundImage(img, fc.renderAll.bind(fc));
          });
        }
      } catch (e) { }

      // Detect text for Magic Edit overlay ONLY
      try {
        const textContent = await page.getTextContent();
        const items = textContent.items.map((item: any) => {
          let x, y, fontSize, width;
          const pdfH = page.getViewport({ scale: 1 }).height;
          if ((pdfjsLib as any).Util && viewport.transform) {
            const tx = (pdfjsLib as any).Util.transform(viewport.transform, item.transform);
            fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
            x = tx[4];
            y = tx[5] - fontSize;
            width = item.width * (viewport.width / page.getViewport({ scale: 1 }).width);
          } else {
            x = item.transform[4] * scale;
            y = (pdfH - item.transform[5]) * scale - (Math.sqrt(item.transform[3] * item.transform[3]) * scale);
            fontSize = Math.sqrt(item.transform[3] * item.transform[3]) * scale;
            width = item.width * scale;
          }
          return { id: 'text-' + Math.random(), x, y, fontSize, width, text: item.str };
        });
        setTextItems(items.filter((i: any) => i.text.trim().length > 0));
      } catch (e) { }
    };
    renderPage();
  }, [pdfDoc, pageIndex, scale]);

  const handleTextLayerClick = (item: any, e: React.MouseEvent) => {
    if (tool !== 'edit-text') return;
    e.stopPropagation();
    const x = item.x;
    const y = item.y;
    const w = item.width;

    // Batch addition for smoother undo/redo
    onAddElements([
      { type: 'rect', x: x - 4, y: y - 5, width: w + 8, height: item.fontSize + 10, fill: '#FFFFFF', opacity: 1 },
      { type: 'text', x: x, y: y, text: item.text, fontSize: item.fontSize, color: color === '#000000' ? '#000000' : color }
    ]);
  };

  return (
    <div ref={containerRef} className="relative shadow-2xl rounded-sm group mb-8 bg-white overflow-hidden"
      style={{ touchAction: 'none' }}
    >
      <div className="absolute top-2 left-2 bg-gray-800 text-gray-400 text-[10px] px-2 py-0.5 rounded shadow-md border border-gray-700 z-10 opacity-50 group-hover:opacity-100 transition-opacity">Page {pageIndex + 1}</div>
      <canvas ref={canvasRef} />
      {!loaded && <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm"><Loader2 className="animate-spin text-pink-600" /></div>}

      {tool === 'edit-text' && loaded && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
          {textItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="absolute cursor-text pointer-events-auto hover:bg-pink-500/10 hover:border-pink-500/50 border border-transparent transition-all rounded"
              style={{
                left: item.x - 2,
                top: item.y - 2,
                width: item.width + 4,
                height: item.fontSize + 4,
                zIndex: 60
              }}
              onClick={(e) => handleTextLayerClick(item, e)}
              title="Click to Rewrite"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, title, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={`p-2 rounded-lg transition-all ${active ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700'} ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`} title={title}>
      <Icon size={18} />
    </button>
  )
}

