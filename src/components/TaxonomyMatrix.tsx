import React from 'react';
import { ImageSpecimen } from '../types/taxonomy';
import { BarChart2, Layers, BookOpen, Compass } from 'lucide-react';

interface TaxonomyMatrixProps {
  specimens: ImageSpecimen[];
  onSelectCategory: (category: string) => void;
  onOpenCuratorialCritique: (category?: string) => void;
  onInspect: (specimen: ImageSpecimen) => void;
}

export const TaxonomyMatrix: React.FC<TaxonomyMatrixProps> = ({
  specimens,
  onSelectCategory,
  onOpenCuratorialCritique,
  onInspect,
}) => {
  const analyzed = specimens.filter((s) => s.status === 'analyzed' && s.analysis);
  const total = analyzed.length || 1;

  // Group by category
  const categoryGroups: Record<
    string,
    { count: number; specimens: ImageSpecimen[]; dominantColors: string[] }
  > = {};

  analyzed.forEach((s) => {
    if (!s.analysis) return;
    const cat = s.analysis.primaryCategory;
    if (!categoryGroups[cat]) {
      categoryGroups[cat] = { count: 0, specimens: [], dominantColors: [] };
    }
    categoryGroups[cat].count += 1;
    categoryGroups[cat].specimens.push(s);
    if (s.analysis.colorPalette.dominantHex) {
      categoryGroups[cat].dominantColors.push(s.analysis.colorPalette.dominantHex);
    }
  });

  // Group by Macro Domain
  const domainCounts: Record<string, number> = {};
  analyzed.forEach((s) => {
    const d = s.analysis?.macroDomain || 'Other';
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  });

  // Aggregate detected entities
  const entityFrequency: Record<string, { count: number; totalConf: number; category: string }> = {};
  analyzed.forEach((s) => {
    s.analysis?.detectedEntities?.forEach((ent) => {
      if (!entityFrequency[ent.name]) {
        entityFrequency[ent.name] = { count: 0, totalConf: 0, category: ent.category };
      }
      entityFrequency[ent.name].count += 1;
      entityFrequency[ent.name].totalConf += ent.confidence;
    });
  });

  const sortedEntities = Object.entries(entityFrequency)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 16);

  // Geometry distribution
  const geometryCounts: Record<string, number> = {};
  analyzed.forEach((s) => {
    const g = s.analysis?.compositionalAttributes?.geometry || 'Unspecified';
    geometryCounts[g] = (geometryCounts[g] || 0) + 1;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* Editorial Overview Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <BarChart2 className="h-4 w-4 text-zinc-400" />
            <span>SPECTRAL & TAXONOMIC DISTRIBUTION</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-white tracking-tight">
            Taxonomy Breakdown & Structural Index
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Quantitative deconstruction of the local image collection derived via Gemini 3.8 Flash multimodal computer vision inference.
          </p>
        </div>

        <button
          onClick={() => onOpenCuratorialCritique()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-colors self-start md:self-auto"
        >
          <BookOpen className="h-4 w-4" />
          <span>Generate Curatorial Synthesis</span>
        </button>
      </div>

      {/* Primary Category Distribution List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold font-display text-white">
            Primary Semantic Categories ({Object.keys(categoryGroups).length})
          </h3>
          <span className="text-xs font-mono text-zinc-500">SORTED BY POPULATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categoryGroups)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([cat, data]) => {
              const pct = Math.round((data.count / total) * 100);
              return (
                <div
                  key={cat}
                  className="bg-[#121316] border border-white/8 hover:border-white/20 rounded-lg p-4 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white hover:text-zinc-300 transition-colors cursor-pointer"
                        onClick={() => onSelectCategory(cat)}
                      >
                        {cat}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
                        <span>{data.count} specimen{data.count === 1 ? '' : 's'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{pct}% of catalog</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenCuratorialCritique(cat)}
                      className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-white border border-white/10 rounded hover:bg-white/5 transition-colors"
                    >
                      Critique →
                    </button>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>

                  {/* Specimen Thumbnails Preview */}
                  <div className="flex items-center gap-2 pt-1 overflow-x-auto scrollbar-none">
                    {data.specimens.map((spec) => (
                      <img
                        key={spec.id}
                        src={spec.url}
                        alt=""
                        onClick={() => onInspect(spec)}
                        className="w-10 h-10 object-cover rounded border border-white/10 cursor-pointer hover:scale-110 hover:border-white transition-transform"
                        title={spec.analysis?.title}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Macro Domains & Compositional Geometry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Macro Domains */}
        <div className="bg-[#121316] border border-white/8 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Layers className="h-4 w-4" />
            <span>MACRO DOMAIN BALANCE</span>
          </div>

          <div className="space-y-3">
            {Object.entries(domainCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([domain, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={domain} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-200 font-medium">{domain}</span>
                      <span className="font-mono text-zinc-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-300" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Compositional Geometries */}
        <div className="bg-[#121316] border border-white/8 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Compass className="h-4 w-4" />
            <span>COMPOSITIONAL GEOMETRY DYNAMICS</span>
          </div>

          <div className="space-y-3">
            {Object.entries(geometryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([geom, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={geom} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-200 font-medium">{geom}</span>
                      <span className="font-mono text-zinc-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Optical Entity Frequency Index */}
      <div className="bg-[#121316] border border-white/8 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>COMPUTER VISION DETECTED ENTITIES INDEX</span>
          </div>
          <span className="text-xs font-mono text-zinc-400">CONFIDENCE WEIGHTED</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sortedEntities.map(([name, data]) => {
            const avgConf = Math.round((data.totalConf / data.count) * 100);
            return (
              <div
                key={name}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs text-zinc-300"
              >
                <span className="font-medium text-white">{name}</span>
                <span className="text-[10px] font-mono text-zinc-500">×{data.count}</span>
                <span className="text-[10px] font-mono text-emerald-400">{avgConf}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
