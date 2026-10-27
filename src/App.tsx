/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ImageSpecimen, 
  ViewMode, 
  SemanticSearchResult 
} from './types/taxonomy';
import { 
  getStoredSpecimens, 
  saveSpecimen, 
  saveSpecimens, 
  deleteSpecimen as dbDeleteSpecimen,
  resetArchiveToSeeds 
} from './services/storage';
import { 
  analyzeImageSpecimen, 
  performSemanticSearch 
} from './services/api';
import { Header } from './components/Header';
import { SearchBarAndFilters } from './components/SearchBarAndFilters';
import { SpecimenCard } from './components/SpecimenCard';
import { SpatialVectorMap } from './components/SpatialVectorMap';
import { TaxonomyMatrix } from './components/TaxonomyMatrix';
import { SpecimenDossierModal } from './components/SpecimenDossierModal';
import { IngestDropzoneModal } from './components/IngestDropzoneModal';
import { CuratorialCritiqueModal } from './components/CuratorialCritiqueModal';
import { LocalEncoderModal } from './components/LocalEncoderModal';
import { LocalEncoderStatus } from './types/taxonomy';
import { checkLocalEncoderStatus, findVisuallySimilarGemma } from './services/api';
import { Sparkles, ImagePlus, AlertCircle } from 'lucide-react';

export default function App() {
  const [specimens, setSpecimens] = useState<ImageSpecimen[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoadingStorage, setIsLoadingStorage] = useState(true);

  // Local 170M Vision Encoder Status
  const [localEncoderStatus, setLocalEncoderStatus] = useState<LocalEncoderStatus>({
    connected: false,
    endpoint: 'http://localhost:8000/embed/vision',
    model: 'EmbeddingGemma-2-170M-Vision',
  });
  const [isLocalEncoderOpen, setIsLocalEncoderOpen] = useState(false);

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Record<string, SemanticSearchResult>>({});
  const [queryInterpretation, setQueryInterpretation] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemperature, setSelectedTemperature] = useState<string | null>(null);
  const [selectedMacroDomain, setSelectedMacroDomain] = useState<string | null>(null);

  // Modals & Inspection state
  const [inspectedSpecimen, setInspectedSpecimen] = useState<ImageSpecimen | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCritiqueOpen, setIsCritiqueOpen] = useState(false);
  const [critiqueCategory, setCritiqueCategory] = useState<string | undefined>(undefined);

  // Batch analysis state
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Check local encoder status
  const refreshEncoderStatus = useCallback(async () => {
    try {
      const st = await checkLocalEncoderStatus();
      setLocalEncoderStatus(st);
    } catch {
      // non-blocking
    }
  }, []);

  // Load initial specimens and check encoder on mount
  useEffect(() => {
    async function load() {
      try {
        const stored = await getStoredSpecimens();
        setSpecimens(stored);
      } catch (err) {
        console.error('Failed to load local specimens:', err);
      } finally {
        setIsLoadingStorage(false);
      }
    }
    load();
    refreshEncoderStatus();
  }, [refreshEncoderStatus]);

  // Compute available categories and counts
  const { allCategories, categoryCounts, macroDomains } = useMemo(() => {
    const cats: Record<string, number> = {};
    const domains = new Set<string>();

    specimens.forEach((s) => {
      if (s.analysis) {
        const cat = s.analysis.primaryCategory;
        cats[cat] = (cats[cat] || 0) + 1;
        if (s.analysis.macroDomain) {
          domains.add(s.analysis.macroDomain);
        }
      }
    });

    return {
      allCategories: Object.keys(cats).sort(),
      categoryCounts: cats,
      macroDomains: Array.from(domains).sort(),
    };
  }, [specimens]);

  // Analyzed / Unanalyzed counters
  const analyzedCount = specimens.filter((s) => s.status === 'analyzed' && s.analysis).length;
  const unanalyzedCount = specimens.filter((s) => s.status === 'unanalyzed' || s.status === 'error').length;

  // Single specimen computer vision analysis
  const handleAnalyzeSpecimen = useCallback(async (specimen: ImageSpecimen) => {
    setAnalysisError(null);
    setSpecimens((prev) =>
      prev.map((s) => (s.id === specimen.id ? { ...s, status: 'analyzing', errorMessage: undefined } : s))
    );

    try {
      const isBase64 = specimen.url.startsWith('data:');
      const analysis = await analyzeImageSpecimen({
        imageBase64: isBase64 ? specimen.url : undefined,
        imageUrl: !isBase64 ? specimen.url : undefined,
      });

      const updated: ImageSpecimen = {
        ...specimen,
        status: 'analyzed',
        analysis,
        errorMessage: undefined,
      };

      await saveSpecimen(updated);

      setSpecimens((prev) => prev.map((s) => (s.id === specimen.id ? updated : s)));

      if (inspectedSpecimen?.id === specimen.id) {
        setInspectedSpecimen(updated);
      }
    } catch (err: any) {
      console.error('Specimen analysis error:', err);
      const failed: ImageSpecimen = {
        ...specimen,
        status: 'error',
        errorMessage: err.message || 'Vision classification failed',
      };
      await saveSpecimen(failed);
      setSpecimens((prev) => prev.map((s) => (s.id === specimen.id ? failed : s)));
      setAnalysisError(err.message || 'Computer vision categorization failed.');
    }
  }, [inspectedSpecimen]);

  // Batch analysis across all unclassified specimens
  const handleBatchAnalyze = async () => {
    const unanalyzed = specimens.filter((s) => s.status === 'unanalyzed' || s.status === 'error');
    if (unanalyzed.length === 0) return;

    setIsBatchAnalyzing(true);
    setAnalysisError(null);

    for (const specimen of unanalyzed) {
      try {
        await handleAnalyzeSpecimen(specimen);
      } catch (e) {
        console.warn('Batch item failed:', e);
      }
    }

    setIsBatchAnalyzing(false);
  };

  // Perform Natural Language Semantic Vector Search
  const handleRunSemanticSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setAnalysisError(null);

    try {
      const { queryInterpretation: interp, results } = await performSemanticSearch(
        searchQuery.trim(),
        specimens
      );

      setQueryInterpretation(interp);
      const resultMap: Record<string, SemanticSearchResult> = {};
      results.forEach((r) => {
        resultMap[r.id] = r;
      });
      setSearchResults(resultMap);
    } catch (err: any) {
      setAnalysisError(err.message || 'Semantic search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  // Find visually similar specimens using 170M Vision Encoder vectors
  const handleFindSimilar = async (specimen: ImageSpecimen) => {
    let vec = specimen.embeddingGemmaVector;
    if (!vec || vec.length === 0) {
      await handleAnalyzeSpecimen(specimen);
      const refreshed = specimens.find((s) => s.id === specimen.id);
      vec = refreshed?.embeddingGemmaVector;
    }
    if (!vec || vec.length === 0) return;

    setIsSearching(true);
    setAnalysisError(null);

    try {
      const matches = await findVisuallySimilarGemma(vec, specimens);
      const resultMap: Record<string, SemanticSearchResult> = {};
      matches.forEach((m) => {
        resultMap[m.id] = {
          id: m.id,
          score: Math.max(0, m.score),
          rationale: `EmbeddingGemma 170M visual vector similarity: ${Math.round(m.score * 100)}%`,
        };
      });
      setSearchResults(resultMap);
      setSearchQuery(`Visual Proximity: ${specimen.analysis?.title || specimen.filename}`);
      setQueryInterpretation(`Ranked by 768-dimensional vision vector cosine similarity to "${specimen.analysis?.title || specimen.filename}"`);
    } catch (err: any) {
      setAnalysisError(err.message || 'Visual similarity search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults({});
    setQueryInterpretation(null);
  };

  // Ingest newly uploaded files
  const handleIngestFiles = async (
    files: Array<{ filename: string; url: string; sizeBytes: number; width?: number; height?: number }>,
    autoAnalyze: boolean
  ) => {
    const now = new Date().toISOString();
    const newItems: ImageSpecimen[] = files.map((f, i) => ({
      id: `local-${Date.now()}-${i}`,
      filename: f.filename,
      url: f.url,
      sizeBytes: f.sizeBytes,
      width: f.width,
      height: f.height,
      dateAdded: now,
      status: 'unanalyzed',
    }));

    await saveSpecimens(newItems);
    setSpecimens((prev) => [...newItems, ...prev]);

    if (autoAnalyze) {
      // Analyze new items asynchronously
      for (const item of newItems) {
        handleAnalyzeSpecimen(item);
      }
    }
  };

  // Delete specimen
  const handleDeleteSpecimen = async (id: string) => {
    await dbDeleteSpecimen(id);
    setSpecimens((prev) => prev.filter((s) => s.id !== id));
    if (inspectedSpecimen?.id === id) {
      setInspectedSpecimen(null);
    }
  };

  // Manual category override
  const handleUpdateCategory = async (id: string, newCategory: string) => {
    const item = specimens.find((s) => s.id === id);
    if (!item || !item.analysis) return;

    const updated: ImageSpecimen = {
      ...item,
      analysis: {
        ...item.analysis,
        primaryCategory: newCategory,
      },
    };

    await saveSpecimen(updated);
    setSpecimens((prev) => prev.map((s) => (s.id === id ? updated : s)));
    if (inspectedSpecimen?.id === id) {
      setInspectedSpecimen(updated);
    }
  };

  // Export full catalog JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(specimens, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `semantica-taxonomy-vault-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Reset to default seed archive
  const handleResetArchive = async () => {
    if (window.confirm('Reset gallery to initial curated specimen taxonomy? This will clear locally ingested images.')) {
      const reset = await resetArchiveToSeeds();
      setSpecimens(reset);
      handleClearSearch();
      setSelectedCategory(null);
      setSelectedTemperature(null);
      setSelectedMacroDomain(null);
    }
  };

  // Filtered specimens logic
  const filteredSpecimens = useMemo(() => {
    let result = [...specimens];

    // If semantic search active and returned results, sort by score and filter
    const isSearchActive = Object.keys(searchResults).length > 0;
    if (isSearchActive) {
      result = result
        .filter((s) => searchResults[s.id] !== undefined)
        .sort((a, b) => (searchResults[b.id]?.score || 0) - (searchResults[a.id]?.score || 0));
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((s) => s.analysis?.primaryCategory === selectedCategory);
    }

    // Temperature filter
    if (selectedTemperature) {
      result = result.filter((s) => s.analysis?.colorPalette?.temperature === selectedTemperature);
    }

    // Macro domain filter
    if (selectedMacroDomain) {
      result = result.filter((s) => s.analysis?.macroDomain === selectedMacroDomain);
    }

    return result;
  }, [specimens, searchResults, selectedCategory, selectedTemperature, selectedMacroDomain]);

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-zinc-100 flex flex-col selection:bg-white selection:text-black">
      {/* Header Bar */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        specimenCount={specimens.length}
        analyzedCount={analyzedCount}
        unanalyzedCount={unanalyzedCount}
        isBatchAnalyzing={isBatchAnalyzing}
        localEncoderStatus={localEncoderStatus}
        onOpenUpload={() => setIsUploadOpen(true)}
        onBatchAnalyze={handleBatchAnalyze}
        onOpenCritique={() => {
          setCritiqueCategory(selectedCategory || undefined);
          setIsCritiqueOpen(true);
        }}
        onExportJSON={handleExportJSON}
        onResetArchive={handleResetArchive}
        onOpenLocalEncoder={() => setIsLocalEncoderOpen(true)}
      />

      {/* Global Error Banner if any */}
      {analysisError && (
        <div className="mx-6 mt-4 p-3.5 bg-rose-950/60 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{analysisError}</span>
          </div>
          <button
            onClick={() => setAnalysisError(null)}
            className="text-rose-400 hover:text-white font-mono text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <SearchBarAndFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRunSemanticSearch={handleRunSemanticSearch}
        isSearching={isSearching}
        queryInterpretation={queryInterpretation}
        onClearSearch={handleClearSearch}
        allCategories={allCategories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        selectedTemperature={selectedTemperature}
        setSelectedTemperature={setSelectedTemperature}
        macroDomains={macroDomains}
        selectedMacroDomain={selectedMacroDomain}
        setSelectedMacroDomain={setSelectedMacroDomain}
        totalFiltered={filteredSpecimens.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {isLoadingStorage ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="font-mono text-xs text-zinc-400">Accessing Local Gallery Vault...</span>
          </div>
        ) : specimens.length === 0 ? (
          /* Empty State */
          <div className="py-24 px-6 text-center max-w-md mx-auto space-y-4">
            <div className="h-16 w-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
              <ImagePlus className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-display text-white">Local Vault Empty</h2>
              <p className="text-xs text-zinc-400">
                Ingest local photographs or restore the default curated specimen archive to begin computer vision semantic categorization.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleResetArchive}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-xs font-semibold text-white hover:bg-zinc-700"
              >
                Restore Seeds
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200"
              >
                Ingest Images
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* View 1: Algorithmic Dynamic Grid */
          <div className="p-6">
            {filteredSpecimens.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 font-mono text-xs">
                No specimens match the active semantic criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSpecimens.map((specimen, idx) => (
                  <SpecimenCard
                    key={specimen.id}
                    specimen={specimen}
                    index={idx}
                    onInspect={setInspectedSpecimen}
                    onAnalyze={handleAnalyzeSpecimen}
                    onDelete={handleDeleteSpecimen}
                    onFindSimilar={handleFindSimilar}
                    searchScore={searchResults[specimen.id]?.score}
                    searchRationale={searchResults[specimen.id]?.rationale}
                  />
                ))}
              </div>
            )}
          </div>
        ) : viewMode === 'spatial' ? (
          /* View 2: Spatial Vector Map (Semantic Constellation) */
          <SpatialVectorMap
            specimens={filteredSpecimens}
            onInspect={setInspectedSpecimen}
            selectedCategory={selectedCategory}
          />
        ) : (
          /* View 3: Taxonomy Matrix & Spectral Analysis */
          <TaxonomyMatrix
            specimens={specimens}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setViewMode('grid');
            }}
            onOpenCuratorialCritique={(cat) => {
              setCritiqueCategory(cat);
              setIsCritiqueOpen(true);
            }}
            onInspect={setInspectedSpecimen}
          />
        )}
      </main>

      {/* Footer Meta */}
      <footer className="border-t border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-zinc-500">
        <div className="flex items-center gap-3">
          <span>SEMANTICA OPTICAL ARCHIVE</span>
          <span className="text-zinc-700">·</span>
          <span>AUTONOMOUS LOCAL TAXONOMY</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{filteredSpecimens.length} SPECIMENS IN VIEWPORT</span>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-400">GEMINI MULTIMODAL INFERENCE</span>
        </div>
      </footer>

      {/* Ingest Dropzone Modal */}
      <IngestDropzoneModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onIngestFiles={handleIngestFiles}
      />

      {/* Specimen Dossier Modal */}
      <SpecimenDossierModal
        specimen={inspectedSpecimen}
        onClose={() => setInspectedSpecimen(null)}
        onReAnalyze={handleAnalyzeSpecimen}
        onUpdateCategory={handleUpdateCategory}
        allCategories={allCategories}
        isAnalyzing={inspectedSpecimen ? inspectedSpecimen.status === 'analyzing' : false}
      />

      {/* Curatorial Critique Modal */}
      <CuratorialCritiqueModal
        isOpen={isCritiqueOpen}
        onClose={() => setIsCritiqueOpen(false)}
        category={critiqueCategory}
        specimens={specimens}
      />

      {/* Local 170M Vision Encoder Setup & Status Modal */}
      <LocalEncoderModal
        isOpen={isLocalEncoderOpen}
        onClose={() => setIsLocalEncoderOpen(false)}
        status={localEncoderStatus}
        onRefreshStatus={refreshEncoderStatus}
      />
    </div>
  );
}
