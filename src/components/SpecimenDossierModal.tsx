import React, { useState } from 'react';
import { ImageSpecimen } from '../types/taxonomy';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Compass, 
  Palette, 
  Eye, 
  FileText,
  Sliders
} from 'lucide-react';

interface SpecimenDossierModalProps {
  specimen: ImageSpecimen | null;
  onClose: () => void;
  onReAnalyze: (specimen: ImageSpecimen) => void;
  onUpdateCategory: (id: string, newCategory: string) => void;
  allCategories: string[];
  isAnalyzing: boolean;
}

export const SpecimenDossierModal: React.FC<SpecimenDossierModalProps> = ({
  specimen,
  onClose,
  onReAnalyze,
  onUpdateCategory,
  allCategories,
  isAnalyzing,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  if (!specimen) return null;

  const analysis = specimen.analysis;

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleSaveCategory = () => {
    if (customCategory.trim()) {
      onUpdateCategory(specimen.id, customCategory.trim());
      setIsEditingCategory(false);
      setCustomCategory('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] bg-[#0e0f13] border border-white/15 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121316]">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-zinc-400">
              SPECIMEN DOSSIER // {specimen.filename}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreenImage(!isFullscreenImage)}
              className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10 transition-colors"
              title={isFullscreenImage ? 'Exit image zoom' : 'Expand image'}
            >
              {isFullscreenImage ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded bg-zinc-900 border border-white/10 transition-colors"
              title="Close dossier"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image Specimen Display */}
          <div className={`space-y-4 ${isFullscreenImage ? 'lg:col-span-12' : 'lg:col-span-6'}`}>
            <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center group max-h-[68vh]">
              <img
                src={specimen.url}
                alt={analysis?.title || specimen.filename}
                className="w-full h-auto max-h-[68vh] object-contain"
              />

              {/* Scanning visual state if re-analyzing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-vision-sweep" />
                  <span className="mt-4 font-mono text-xs text-emerald-400">
                    Executing Neural Taxonomic Decomposition...
                  </span>
                </div>
              )}
            </div>

            {/* Re-analysis and category modification triggers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="text-xs font-mono text-zinc-400">
                Resolution: {specimen.width || 'Native'} × {specimen.height || 'Native'}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingCategory(!isEditingCategory)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-zinc-900 border border-white/10 hover:text-white transition-colors"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Modify Category</span>
                </button>
                <button
                  onClick={() => onReAnalyze(specimen)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Re-run Vision Inference</span>
                </button>
              </div>
            </div>

            {/* Quick Category Override Dropdown/Input */}
            {isEditingCategory && (
              <div className="p-3 bg-zinc-900/90 rounded border border-white/15 space-y-2">
                <div className="text-xs font-mono text-zinc-400">Assign Category:</div>
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-black border border-white/20 rounded px-2.5 py-1.5 text-xs text-white"
                    onChange={(e) => onUpdateCategory(specimen.id, e.target.value)}
                    value={analysis?.primaryCategory || ''}
                  >
                    {allCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or type custom category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="flex-1 bg-black border border-white/20 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-500 font-mono"
                  />
                  <button
                    onClick={handleSaveCategory}
                    className="px-3 py-1 bg-white text-black text-xs font-medium rounded hover:bg-zinc-200"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Deep Vision Analysis Dossier */}
          {!isFullscreenImage && (
            <div className="lg:col-span-6 space-y-6">
              {/* Title & Classification Hierarchy */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span>{analysis?.macroDomain || 'Universal Domain'}</span>
                  <span aria-hidden="true">/</span>
                  <span className="text-white font-semibold">
                    {analysis?.primaryCategory || 'Unclassified'}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-display text-white tracking-tight">
                  {analysis?.title || specimen.filename}
                </h3>
                {analysis?.secondaryCategory && (
                  <p className="text-xs text-zinc-400 font-mono">
                    Sub-discipline: {analysis.secondaryCategory}
                  </p>
                )}
              </div>

              {/* Curator Notes / Architecture Assessment */}
              {analysis?.curatorNotes && (
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <FileText className="h-3.5 w-3.5" />
                    <span>CURATORIAL ARCHITECTURAL NOTES</span>
                  </div>
                  <p className="text-xs leading-relaxed text-zinc-300 font-sans">
                    {analysis.curatorNotes}
                  </p>
                </div>
              )}

              {/* Sub-Taxa & Semantic Descriptors */}
              {analysis?.subTaxa && analysis.subTaxa.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>FINE-GRAINED SUB-TAXA CLASSIFICATIONS</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-300 font-mono">
                    {analysis.subTaxa.map((tax, i) => (
                      <span key={i} className="px-2.5 py-1 bg-zinc-900 rounded border border-white/10">
                        {tax}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chromatic Palette & Frequency Breakdown */}
              {analysis?.colorPalette && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5" />
                      <span>CHROMATIC FREQUENCY DISTRIBUTION</span>
                    </div>
                    <span>{analysis.colorPalette.temperature} · {analysis.colorPalette.luminance}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {analysis.colorPalette.palette.map((swatch, idx) => (
                      <button
                        key={idx}
                        onClick={() => copyToClipboard(swatch.hex)}
                        className="group flex flex-col p-2 rounded bg-zinc-900/80 border border-white/10 hover:border-white/30 transition-all text-left"
                      >
                        <div
                          className="w-full h-8 rounded mb-2 border border-white/10 transition-transform group-hover:scale-95"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                          <span>{swatch.hex}</span>
                          {copiedHex === swatch.hex ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3 text-zinc-500 group-hover:text-white" />
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-400 truncate mt-0.5">
                          {swatch.name} ({swatch.percentage}%)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compositional Geometries & Optics */}
              {analysis?.compositionalAttributes && (
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Compass className="h-3.5 w-3.5" />
                    <span>COMPOSITIONAL OPTICAL VECTORS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Geometry</span>
                      <p className="font-semibold text-white mt-0.5">
                        {analysis.compositionalAttributes.geometry}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Depth of Field</span>
                      <p className="font-semibold text-white mt-0.5">
                        {analysis.compositionalAttributes.depthOfField}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Visual Density</span>
                      <p className="font-semibold text-white mt-0.5">
                        {analysis.compositionalAttributes.visualDensity}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">Contrast Dynamics</span>
                      <p className="font-semibold text-white mt-0.5">
                        {analysis.compositionalAttributes.contrastRatio}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Detected Entities with Confidence Ratings */}
              {analysis?.detectedEntities && analysis.detectedEntities.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <Eye className="h-3.5 w-3.5" />
                    <span>RECOGNIZED OPTICAL ENTITIES</span>
                  </div>

                  <div className="space-y-2">
                    {analysis.detectedEntities.map((ent, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-white/8 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{ent.name}</span>
                          <span className="text-[10px] font-mono text-zinc-400 uppercase">
                            [{ent.category} · {ent.focalRelevance}]
                          </span>
                        </div>
                        <span className="font-mono text-emerald-400 font-semibold">
                          {Math.round(ent.confidence * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spatial Vector Coordinates Gauge */}
              {analysis?.vectorCoordinates && (
                <div className="p-4 bg-zinc-900/60 rounded-lg border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>SEMANTIC VECTOR TOPOLOGY (3D EMBEDDING)</span>
                    <span className="text-zinc-500">NORMALIZED [-1.0 TO +1.0]</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* X */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>Organic (-1.0)</span>
                        <span className="text-white font-bold">X: {analysis.vectorCoordinates.x.toFixed(2)}</span>
                        <span>Synthetic (+1.0)</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full relative overflow-hidden">
                        <div
                          className="h-full bg-white absolute"
                          style={{
                            left: `${((analysis.vectorCoordinates.x + 1) / 2) * 100}%`,
                            width: '4px',
                            transform: 'translateX(-50%)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Y */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                        <span>Minimal Void (-1.0)</span>
                        <span className="text-white font-bold">Y: {analysis.vectorCoordinates.y.toFixed(2)}</span>
                        <span>Hyper-Dense (+1.0)</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full relative overflow-hidden">
                        <div
                          className="h-full bg-white absolute"
                          style={{
                            left: `${((analysis.vectorCoordinates.y + 1) / 2) * 100}%`,
                            width: '4px',
                            transform: 'translateX(-50%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EmbeddingGemma 2 · 170M Vision Vector Section */}
              <div className="p-4 bg-zinc-900/60 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">EMBEDDINGGEMMA 2 · 170M VISION ENCODER</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">768-DIMENSIONAL L₂ NORMALIZED</span>
                </div>

                {specimen.embeddingGemmaVector && specimen.embeddingGemmaVector.length > 0 ? (
                  <div className="space-y-2">
                    {/* Visual Vector Density Sparkline / Heatmap */}
                    <div className="w-full h-4 bg-black rounded overflow-hidden flex items-stretch border border-white/10" title="768-dimensional visual vector heat map">
                      {specimen.embeddingGemmaVector.slice(0, 96).map((val, idx) => {
                        const intensity = Math.min(1, Math.max(0, (val + 0.1) * 5));
                        return (
                          <div
                            key={idx}
                            className="flex-1"
                            style={{
                              backgroundColor: val > 0 ? `rgba(52, 211, 153, ${intensity})` : `rgba(147, 197, 253, ${intensity})`,
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                      <span>v[0]: {specimen.embeddingGemmaVector[0]?.toFixed(4)}</span>
                      <span>v[384]: {specimen.embeddingGemmaVector[384]?.toFixed(4)}</span>
                      <span>v[767]: {specimen.embeddingGemmaVector[767]?.toFixed(4)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 font-mono">
                    Visual vector not yet extracted. Incur inference via local 170M vision microservice.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
