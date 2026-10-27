import React from 'react';
import { Search, X, SlidersHorizontal, Sparkles } from 'lucide-react';

interface SearchBarAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRunSemanticSearch: () => void;
  isSearching: boolean;
  queryInterpretation: string | null;
  onClearSearch: () => void;
  allCategories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  categoryCounts: Record<string, number>;
  selectedTemperature: string | null;
  setSelectedTemperature: (temp: string | null) => void;
  macroDomains: string[];
  selectedMacroDomain: string | null;
  setSelectedMacroDomain: (domain: string | null) => void;
  totalFiltered: number;
}

export const SearchBarAndFilters: React.FC<SearchBarAndFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  onRunSemanticSearch,
  isSearching,
  queryInterpretation,
  onClearSearch,
  allCategories,
  selectedCategory,
  setSelectedCategory,
  categoryCounts,
  selectedTemperature,
  setSelectedTemperature,
  macroDomains,
  selectedMacroDomain,
  setSelectedMacroDomain,
  totalFiltered,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onRunSemanticSearch();
    }
  };

  const hasActiveFilters = Boolean(
    selectedCategory || selectedTemperature || selectedMacroDomain || searchQuery
  );

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSelectedTemperature(null);
    setSelectedMacroDomain(null);
    onClearSearch();
  };

  return (
    <div className="px-6 py-4 border-b border-white/5 space-y-3">
      {/* Search Input Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by natural language concept (e.g. 'monolithic brutalist facades with sharp shadows' or 'organic macro foliage')..."
            className="w-full pl-10 pr-24 py-2.5 bg-zinc-900/80 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all font-mono"
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="p-1 text-zinc-400 hover:text-white"
                title="Clear query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              onClick={onRunSemanticSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40"
            >
              <Sparkles className={`h-3 w-3 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Evaluating' : 'Vector Search'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-lg border transition-colors ${
              showAdvanced || selectedTemperature || selectedMacroDomain
                ? 'bg-zinc-800 text-white border-white/20'
                : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Refine</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
            >
              Reset Filters
            </button>
          )}

          <div className="hidden xl:block text-xs font-mono text-zinc-500 pl-2">
            Showing {totalFiltered} specimen{totalFiltered === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Semantic interpretation banner */}
      {queryInterpretation && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-zinc-900/90 border border-white/10 text-xs text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="font-mono text-zinc-500 uppercase tracking-wider">Semantic Parsing:</span>
          <span className="text-zinc-200 italic font-sans">{queryInterpretation}</span>
        </div>
      )}

      {/* Category Filter Buttons (Interactive Segmented Bar) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          All Specimen Categories
        </button>
        {allCategories.map((cat) => {
          const count = categoryCounts[cat] || 0;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] font-mono ${selectedCategory === cat ? 'text-zinc-700' : 'text-zinc-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Drawers (Macro Domain & Light Temperature) */}
      {showAdvanced && (
        <div className="pt-2 pb-1 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 text-xs">
          {/* Macro Domain */}
          <div className="space-y-1.5">
            <span className="font-mono text-zinc-500 uppercase text-[10px]">Macro Domain</span>
            <div className="flex flex-wrap gap-1.5">
              {macroDomains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => setSelectedMacroDomain(selectedMacroDomain === domain ? null : domain)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedMacroDomain === domain
                      ? 'bg-zinc-200 text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Light Temperature */}
          <div className="space-y-1.5">
            <span className="font-mono text-zinc-500 uppercase text-[10px]">Chromatic Temperature</span>
            <div className="flex flex-wrap gap-1.5">
              {['Warm', 'Cool', 'Neutral', 'Bipolar Contrast'].map((temp) => (
                <button
                  key={temp}
                  onClick={() => setSelectedTemperature(selectedTemperature === temp ? null : temp)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedTemperature === temp
                      ? 'bg-zinc-200 text-black font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {temp}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
