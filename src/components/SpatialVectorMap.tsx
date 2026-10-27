import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ImageSpecimen } from '../types/taxonomy';
import { ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';

interface SpatialVectorMapProps {
  specimens: ImageSpecimen[];
  onInspect: (specimen: ImageSpecimen) => void;
  selectedCategory: string | null;
}

export const SpatialVectorMap: React.FC<SpatialVectorMapProps> = ({
  specimens,
  onInspect,
  selectedCategory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport transformation state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredSpecimen, setHoveredSpecimen] = useState<ImageSpecimen | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [projectionMode, setProjectionMode] = useState<'taxonomy' | 'embeddinggemma'>('taxonomy');

  // Filter analyzed specimens
  const validSpecimens = specimens.filter(
    (s) => s.status === 'analyzed' && s.analysis && s.analysis.vectorCoordinates
  );

  // Helper to resolve 2D coordinate for specimen based on projection mode
  const getCoords = useCallback((s: ImageSpecimen) => {
    if (projectionMode === 'embeddinggemma' && s.embeddingGemmaVector && s.embeddingGemmaVector.length >= 2) {
      const vec = s.embeddingGemmaVector;
      let xAcc = 0;
      let yAcc = 0;
      const count = Math.min(64, vec.length);
      for (let i = 0; i < count; i++) {
        const sign = i % 2 === 0 ? 1 : -1;
        xAcc += vec[i] * sign;
        yAcc += vec[(i + 32) % count] * sign;
      }
      return {
        x: Math.tanh(xAcc * 3.2),
        y: Math.tanh(yAcc * 3.2),
      };
    }
    return {
      x: s.analysis?.vectorCoordinates.x ?? 0,
      y: s.analysis?.vectorCoordinates.y ?? 0,
    };
  }, [projectionMode]);

  // Cached image thumbnails for canvas rendering
  const imagesCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload images for canvas
  useEffect(() => {
    validSpecimens.forEach((specimen) => {
      if (!imagesCache.current.has(specimen.id)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = specimen.url;
        img.onload = () => {
          imagesCache.current.set(specimen.id, img);
        };
      }
    });
  }, [validSpecimens]);

  // Center coordinate conversions
  const worldToScreen = useCallback(
    (wx: number, wy: number, width: number, height: number) => {
      const centerX = width / 2 + pan.x;
      const centerY = height / 2 + pan.y;
      const scale = (Math.min(width, height) / 2.3) * zoom;
      return {
        x: centerX + wx * scale,
        y: centerY - wy * scale, // Canvas Y is inverted
      };
    },
    [pan, zoom]
  );

  const screenToWorld = useCallback(
    (sx: number, sy: number, width: number, height: number) => {
      const centerX = width / 2 + pan.x;
      const centerY = height / 2 + pan.y;
      const scale = (Math.min(width, height) / 2.3) * zoom;
      return {
        x: (sx - centerX) / scale,
        y: (centerY - sy) / scale,
      };
    },
    [pan, zoom]
  );

  // Main rendering loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0a0b0d';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;
    const scale = (Math.min(width, height) / 2.3) * zoom;

    // Draw coordinate grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // Sub-grid
    const step = 0.25;
    for (let i = -1; i <= 1.01; i += step) {
      // Vertical
      const p1 = worldToScreen(i, -1.2, width, height);
      const p2 = worldToScreen(i, 1.2, width, height);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // Horizontal
      const h1 = worldToScreen(-1.2, i, width, height);
      const h2 = worldToScreen(1.2, i, width, height);
      ctx.beginPath();
      ctx.moveTo(h1.x, h1.y);
      ctx.lineTo(h2.x, h2.y);
      ctx.stroke();
    }

    // Main Axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;

    // X Axis
    ctx.beginPath();
    ctx.moveTo(centerX - scale * 1.2, centerY);
    ctx.lineTo(centerX + scale * 1.2, centerY);
    ctx.stroke();

    // Y Axis
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - scale * 1.2);
    ctx.lineTo(centerX, centerY + scale * 1.2);
    ctx.stroke();

    // Outer boundary circle
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, scale, 0, Math.PI * 2);
    ctx.stroke();

    // Draw semantic links between nodes in the same category
    for (let i = 0; i < validSpecimens.length; i++) {
      for (let j = i + 1; j < validSpecimens.length; j++) {
        const s1 = validSpecimens[i];
        const s2 = validSpecimens[j];
        if (s1.analysis && s2.analysis) {
          const c1 = getCoords(s1);
          const c2 = getCoords(s2);
          const isSameCategory = s1.analysis.primaryCategory === s2.analysis.primaryCategory;
          const dist = Math.hypot(c1.x - c2.x, c1.y - c2.y);

          if (isSameCategory || dist < 0.45) {
            const p1 = worldToScreen(c1.x, c1.y, width, height);
            const p2 = worldToScreen(c2.x, c2.y, width, height);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = isSameCategory ? 0.25 : 0.08;
            ctx.strokeStyle = s1.analysis.colorPalette.dominantHex
              ? `${s1.analysis.colorPalette.dominantHex}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
              : `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = isSameCategory ? 1.5 : 1;
            ctx.stroke();
          }
        }
      }
    }

    // Draw specimen nodes
    validSpecimens.forEach((specimen) => {
      if (!specimen.analysis) return;
      const coords = getCoords(specimen);
      const pt = worldToScreen(coords.x, coords.y, width, height);

      const isHovered = hoveredSpecimen?.id === specimen.id;
      const isCategoryMatch = !selectedCategory || specimen.analysis.primaryCategory === selectedCategory;

      const baseRadius = 18;
      const radius = isHovered ? baseRadius * 1.3 : baseRadius;

      // Glow halo
      const dominantColor = specimen.analysis.colorPalette.dominantHex || '#ffffff';
      if (isHovered || isCategoryMatch) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = dominantColor;
        ctx.globalAlpha = isHovered ? 0.35 : 0.15;
        ctx.fill();
        ctx.restore();
      }

      // Draw node circle with clipping for image
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.clip();

      const img = imagesCache.current.get(specimen.id);
      if (img && img.complete) {
        ctx.drawImage(img, pt.x - radius, pt.y - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = dominantColor;
        ctx.fillRect(pt.x - radius, pt.y - radius, radius * 2, radius * 2);
      }

      ctx.restore();

      // Border ring
      ctx.save();
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered ? '#ffffff' : dominantColor;
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();
      ctx.restore();

      // Text label below node
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)';
      ctx.textAlign = 'center';
      const label = specimen.analysis.title;
      const truncated = label.length > 20 ? label.slice(0, 19) + '…' : label;
      ctx.fillText(truncated, pt.x, pt.y + radius + 14);
      ctx.restore();
    });
  }, [pan, zoom, validSpecimens, hoveredSpecimen, selectedCategory, worldToScreen]);

  // Resize canvas to container
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Update coordinate HUD
    const world = screenToWorld(mouseX, mouseY, rect.width, rect.height);
    setCursorCoords({
      x: Math.max(-1.5, Math.min(1.5, world.x)),
      y: Math.max(-1.5, Math.min(1.5, world.y)),
    });

    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Check hit test for nodes
    let found: ImageSpecimen | null = null;
    for (const specimen of validSpecimens) {
      if (!specimen.analysis) continue;
      const coords = getCoords(specimen);
      const pt = worldToScreen(
        coords.x,
        coords.y,
        rect.width,
        rect.height
      );
      const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
      if (dist <= 24) {
        found = specimen;
        break;
      }
    }

    setHoveredSpecimen(found);
    if (found) {
      setHoverPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoverPos(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.max(0.4, Math.min(4, prev * factor)));
  };

  const handleClick = () => {
    if (hoveredSpecimen && !isDragging) {
      onInspect(hoveredSpecimen);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[76vh] bg-[#0a0b0d] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoveredSpecimen(null);
          setHoverPos(null);
        }}
        onWheel={handleWheel}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Projection Mode Switcher */}
      <div className="absolute top-4 left-4 z-20 flex items-center p-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/10 text-xs font-mono">
        <button
          onClick={() => setProjectionMode('taxonomy')}
          className={`px-3 py-1.5 rounded transition-all ${
            projectionMode === 'taxonomy'
              ? 'bg-white text-black font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Taxonomy Topo
        </button>
        <button
          onClick={() => setProjectionMode('embeddinggemma')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
            projectionMode === 'embeddinggemma'
              ? 'bg-emerald-400 text-black font-semibold'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>EmbeddingGemma 170M Vectors</span>
        </button>
      </div>

      {/* Axis Orientations */}
      <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono text-zinc-300">
          ↑ HYPER-DENSE / INTRICATE COMPLEXITY
        </span>
      </div>
      <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono text-zinc-300">
          ↓ MINIMAL VOID & NEGATIVE SPACE
        </span>
      </div>
      <div className="absolute left-4 inset-y-0 flex items-center pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono text-zinc-300 -rotate-90">
          ← BIOLOGICAL & ORGANIC
        </span>
      </div>
      <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
        <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-mono text-zinc-300 rotate-90">
          SYNTHETIC & CONSTRUCTED →
        </span>
      </div>

      {/* Map Control HUD */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
        <button
          onClick={() => setZoom((z) => Math.min(4, z * 1.2))}
          className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z * 0.8))}
          className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-white/10 transition-colors"
          title="Reset canvas viewport"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Real-time Cursor Coordinates Readout */}
      <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-zinc-400">
        <Info className="h-3.5 w-3.5 text-zinc-500" />
        <span>VECTOR (X: {cursorCoords.x > 0 ? `+${cursorCoords.x.toFixed(2)}` : cursorCoords.x.toFixed(2)}, Y: {cursorCoords.y > 0 ? `+${cursorCoords.y.toFixed(2)}` : cursorCoords.y.toFixed(2)})</span>
        <span className="text-zinc-600">·</span>
        <span>ZOOM: {Math.round(zoom * 100)}%</span>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredSpecimen && hoverPos && hoveredSpecimen.analysis && (
        <div
          className="fixed pointer-events-none z-50 bg-[#121316]/95 border border-white/20 rounded-lg p-3 shadow-2xl backdrop-blur-md max-w-xs transition-transform"
          style={{
            left: `${hoverPos.x + 16}px`,
            top: `${hoverPos.y - 40}px`,
          }}
        >
          <div className="flex gap-3">
            <img
              src={hoveredSpecimen.url}
              alt=""
              className="w-14 h-14 object-cover rounded border border-white/10"
            />
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-zinc-400 block">
                {hoveredSpecimen.analysis.primaryCategory}
              </span>
              <h4 className="text-xs font-bold text-white line-clamp-1">
                {hoveredSpecimen.analysis.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                <span>X: {hoveredSpecimen.analysis.vectorCoordinates.x.toFixed(2)}</span>
                <span>Y: {hoveredSpecimen.analysis.vectorCoordinates.y.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
