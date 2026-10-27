import React from 'react';
import { LocalEncoderStatus, ViewMode } from '../types/taxonomy';
import { 
  Grid3X3, 
  Orbit, 
  BarChart3, 
  Upload, 
  Sparkles, 
  Download, 
  RotateCcw,
  BookOpen,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  specimenCount: number;
  analyzedCount: number;
  unanalyzedCount: number;
  isBatchAnalyzing: boolean;
  localEncoderStatus?: LocalEncoderStatus;
  onOpenUpload: () => void;
  onBatchAnalyze: () => void;
  onOpenCritique: () => void;
  onExportJSON: () => void;
  onResetArchive: () => void;
  onOpenLocalEncoder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  specimenCount,
  analyzedCount,
  unanalyzedCount,
  isBatchAnalyzing,
  localEncoderStatus,
  onOpenUpload,
  onBatchAnalyze,
  onOpenCritique,
  onExportJSON,
  onResetArchive,
  onOpenLocalEncoder,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0b0d]/90 backdrop-blur-md">
      {/* Top Ticker / Meta Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-2 border-b border-white/5 text-[11px] font-mono text-zinc-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OPTICAL NEURAL INFERENCE
          </span>
          <span className="text-zinc-600">/</span>
          <button
            onClick={onOpenLocalEncoder}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
              localEncoderStatus?.connected
                ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30'
                : 'text-zinc-300 hover:text-white bg-zinc-900 border border-white/10'
            }`}
            title="Configure or test local 170M Vision Encoder"
          >
            <Cpu className="h-3 w-3" />
            <span>170M VISION ENCODER: {localEncoderStatus?.connected ? 'ONLINE' : 'STANDBY'}</span>
          </button>
          <span className="text-zinc-600">/</span>
          <span>INDEXEDDB LOCAL VAULT</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{analyzedCount} OF {specimenCount} CLASSIFIED</span>
          <button
            onClick={onResetArchive}
            className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1"
            title="Reset to default seed archive"
          >
            <RotateCcw className="h-3 w-3" />
            <span>RESET SEEDS</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-4">
        {/* Brand */}
        <div className="flex items-baseline gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-white text-black flex items-center justify-center font-bold text-xs font-mono">
              ∑
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
              SEMANTICA
            </h1>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-zinc-400">
            ALGORITHMIC TAXONOMY ARCHIVE
          </span>
        </div>

        {/* View Mode Switcher (Interactive Segmented Control) */}
        <div className="flex items-center p-1 bg-zinc-900/90 rounded-lg border border-white/10 text-xs font-medium">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'grid'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
            <span>01 Grid</span>
          </button>
          <button
            onClick={() => setViewMode('spatial')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'spatial'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Orbit className="h-3.5 w-3.5" />
            <span>02 Spatial Vector Map</span>
          </button>
          <button
            onClick={() => setViewMode('taxonomy')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md transition-all ${
              viewMode === 'taxonomy'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>03 Taxonomy Matrix</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          {unanalyzedCount > 0 && (
            <button
              onClick={onBatchAnalyze}
              disabled={isBatchAnalyzing}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isBatchAnalyzing ? 'animate-spin' : ''}`} />
              <span>
                {isBatchAnalyzing ? 'Classifying...' : `Categorize All (${unanalyzedCount})`}
              </span>
            </button>
          )}

          <button
            onClick={onOpenCritique}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
            title="Generate overarching curatorial critique"
          >
            <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Curatorial Synthesis</span>
          </button>

          <button
            onClick={onExportJSON}
            className="p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors"
            title="Export full taxonomy JSON"
          >
            <Download className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Ingest Specimen</span>
          </button>
        </div>
      </div>
    </header>
  );
};
