import { CuratorialCritique, ImageSpecimen, SemanticAnalysis, SemanticSearchResult } from '../types/taxonomy';

export async function analyzeImageSpecimen(params: {
  imageBase64?: string;
  mimeType?: string;
  imageUrl?: string;
}): Promise<SemanticAnalysis> {
  const res = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Computer vision categorization request failed.');
  }

  return data.data as SemanticAnalysis;
}

export async function performSemanticSearch(
  query: string,
  items: ImageSpecimen[]
): Promise<{ queryInterpretation: string; results: SemanticSearchResult[] }> {
  const analyzedItems = items.filter((i) => i.status === 'analyzed' && i.analysis);
  const res = await fetch('/api/semantic-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, items: analyzedItems }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Semantic search execution failed.');
  }

  return data.data;
}

export async function generateCuratorialSynthesis(
  category: string,
  items: ImageSpecimen[]
): Promise<CuratorialCritique> {
  const analyzedItems = items.filter((i) => i.status === 'analyzed' && i.analysis);
  const res = await fetch('/api/curatorial-synthesis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, items: analyzedItems }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Curatorial synthesis generation failed.');
  }

  return data.data as CuratorialCritique;
}

export async function checkLocalEncoderStatus(): Promise<{
  connected: boolean;
  endpoint: string;
  model: string;
  latencyMs?: number;
  instructions?: string;
}> {
  try {
    const res = await fetch('/api/embeddinggemma/status');
    const data = await res.json();
    return data;
  } catch {
    return {
      connected: false,
      endpoint: 'http://localhost:8000/embed/vision',
      model: 'EmbeddingGemma-2-170M-Vision',
      latencyMs: 0,
    };
  }
}

export async function encodeImageWithLocalGemma(imageBase64: string): Promise<{
  dimensions: number;
  embedding: number[];
  source: string;
  latencyMs: number;
}> {
  const res = await fetch('/api/embeddinggemma/vision-encode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || '170M Vision Encoding failed');
  }
  return data;
}

export async function findVisuallySimilarGemma(
  targetVector: number[],
  candidates: ImageSpecimen[]
): Promise<Array<{ id: string; score: number }>> {
  const res = await fetch('/api/embeddinggemma/similarity', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetVector, candidates }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Vector similarity search failed');
  }
  return data.matches;
}

