import React from 'react';
import { ImageSpecimen } from '../types/taxonomy';
import { Sparkles, Trash2, Maximize2, Compass } from 'lucide-react';

interface SpecimenCardProps {
  specimen: ImageSpecimen;
  index: number;
  onInspect: (specimen: ImageSpecimen) => void;
  onAnalyze: (specimen: ImageSpecimen) => void;
  onDelete: (id: string) => void;
  onFindSimilar?: (specimen: ImageSpecimen) => void;
  searchScore?: number;
  searchRationale?: string;
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  specimen,
  index,
  onInspect,
  onAnalyze,
  onDelete,
  onFindSimilar,
  searchScore,
  searchRationale,
}) => {
  const isAnalyzed = specimen.status === 'analyzed' && specimen.analysis;
  const isAnalyzing = specimen.status === 'analyzing';

  return (
    <article className="group relative flex flex-col bg-[#121316] border border-white/8 hover:border-white/20 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Search Relevance Badge (if searching) */}
      {typeof searchScore === 'number' && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded text-[11px] font-mono text-amber-300 border border-amber-500/30">
          <Sparkles className="h-3 w-3" />
          <span>Match: {Math.round(searchScore * 100)}%</span>
        </div>
      )}

      {/* Media Container */}
      <div 
        onClick={() => onInspect(specimen)}
        className="relative w-full aspect-[4/3] bg-zinc-950 overflow-hidden cursor-pointer"
      >
        <img
          src={specimen.url}
          alt={specimen.analysis?.title || specimen.filename}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Scanline overlay during active AI vision analysis */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none flex flex-col justify-center items-center">
            <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-vision-sweep" />
            <div className="mt-4 px-3 py-1 bg-black/80 backdrop-blur-md rounded font-mono text-[11px] text-emerald-400 border border-emerald-500/40">
              Inferring Visual Semantics...
            </div>
          </div>
        )}

        {/* Floating Quick Action Overlay */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInspect(specimen);
            }}
            className="p-1.5 rounded bg-black/75 hover:bg-black text-white backdrop-blur-md transition-colors"
            title="Inspect Specimen Dossier"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(specimen.id);
            }}
            className="p-1.5 rounded bg-black/75 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 backdrop-blur-md transition-colors"
            title="Remove Specimen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Chromatic Color Ribbon along bottom of photo */}
        {isAnalyzed && specimen.analysis?.colorPalette?.palette && (
          <div className="absolute bottom-0 inset-x-0 h-1 flex">
            {specimen.analysis.colorPalette.palette.map((swatch, sIdx) => (
              <div
                key={sIdx}
                className="h-full transition-all"
                style={{
                  backgroundColor: swatch.hex,
                  width: `${swatch.percentage}%`,
                }}
                title={`${swatch.name} (${swatch.hex})`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Meta */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Header Metadata (Unboxed text with typographic separators) */}
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
            <span className="text-zinc-500">{String(index + 1).padStart(2, '0')}</span>
            <div className="flex items-center gap-1.5">
              <span>{specimen.analysis?.primaryCategory || 'Unclassified'}</span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span>{specimen.analysis?.colorPalette?.temperature || 'Neutral'}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onInspect(specimen)}
            className="text-base font-bold text-white hover:text-zinc-200 cursor-pointer font-display tracking-tight leading-snug line-clamp-1"
          >
            {specimen.analysis?.title || specimen.filename}
          </h3>

          {/* Sub-discipline / Kicker */}
          {specimen.analysis?.secondaryCategory && (
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
              {specimen.analysis.secondaryCategory}
            </p>
          )}

          {/* Search Rationale if active */}
          {searchRationale && (
            <p className="mt-2 text-xs italic text-amber-200/90 font-serif line-clamp-2">
              "{searchRationale}"
            </p>
          )}
        </div>

        {/* Footer Meta / Vector Coordinates & CTA */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
          {isAnalyzed ? (
            <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
              <Compass className="h-3 w-3 text-zinc-400" />
              <span>
                X:{specimen.analysis?.vectorCoordinates?.x.toFixed(2)} Y:{specimen.analysis?.vectorCoordinates?.y.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-amber-400/90">Awaiting Taxonomy</span>
          )}

          {!isAnalyzed && (
            <button
              onClick={() => onAnalyze(specimen)}
              disabled={isAnalyzing}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Sparkles className="h-3 w-3" />
              <span>{isAnalyzing ? 'Analyzing' : 'Classify'}</span>
            </button>
          )}

          {isAnalyzed && (
            <div className="flex items-center gap-2">
              {onFindSimilar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFindSimilar(specimen);
                  }}
                  className="text-[11px] font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
                  title="Find visually similar specimens using 170M Vision Encoder"
                >
                  Similar
                </button>
              )}
              <button
                onClick={() => onInspect(specimen)}
                className="text-[11px] font-mono text-zinc-400 hover:text-white transition-colors"
              >
                Inspect →
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
