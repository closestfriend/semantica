export interface ColorSwatch {
  hex: string;
  name: string;
  percentage: number;
}

export interface DetectedEntity {
  name: string;
  confidence: number;
  category: string;
  focalRelevance: 'primary' | 'secondary' | 'ambient';
}

export interface SemanticAnalysis {
  title: string;
  primaryCategory: string;
  secondaryCategory: string;
  macroDomain: string;
  subTaxa: string[];
  semanticTags: string[];
  moodAtmosphere: string;
  colorPalette: {
    dominantHex: string;
    temperature: string;
    luminance: string;
    palette: ColorSwatch[];
  };
  compositionalAttributes: {
    geometry: string;
    depthOfField: string;
    visualDensity: string;
    contrastRatio: string;
  };
  detectedEntities: DetectedEntity[];
  vectorCoordinates: {
    x: number; // -1 (Organic) to +1 (Synthetic)
    y: number; // -1 (Minimal) to +1 (Complex)
    z: number; // -1 (Low-Key) to +1 (High-Key)
  };
  curatorNotes: string;
  embeddingGemmaVector?: number[]; // 768-dimensional visual vector from 170M Vision Encoder
}

export interface ImageSpecimen {
  id: string;
  url: string; // Base64 or remote URL
  filename: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  dateAdded: string;
  status: 'unanalyzed' | 'analyzing' | 'analyzed' | 'error';
  errorMessage?: string;
  analysis?: SemanticAnalysis;
  embeddingGemmaVector?: number[]; // Local 170M vision vector
}

export type ViewMode = 'grid' | 'spatial' | 'taxonomy' | 'matrix';

export interface LocalEncoderStatus {
  connected: boolean;
  endpoint: string;
  model: string;
  latencyMs?: number;
}

export interface SemanticSearchResult {
  id: string;
  score: number;
  rationale: string;
}

export interface CuratorialCritique {
  essayTitle: string;
  thematicDiscourse: string;
  chromaticObservations: string;
  structuralAxiom: string;
}
