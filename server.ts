import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// High body limit to allow uploading local high-res photos
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Initialize Google GenAI client (server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Semantic analysis JSON Schema
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Stark, evocative, curated title for the artwork or photograph (e.g. "Monolithic Cantilever II", "Chlorophyll Membrane in Vitro").',
    },
    primaryCategory: {
      type: Type.STRING,
      description: 'Primary overarching taxonomy category (e.g. "Brutalist Architecture", "Botanical & Flora", "Abstract & Geometric", "Human Portraiture", "Industrial & Hardware", "Typographic & Graphic", "Cosmic & Astrophotography", "Still Life & Ceramic", "Textile & Materiality", "Urban Landscape", "Atmospheric Phenomena").',
    },
    secondaryCategory: {
      type: Type.STRING,
      description: 'More specific sub-discipline or artistic movement (e.g. "Precast Facade Studies", "Macro Plant Pigment", "Monochrome Constructivism").',
    },
    macroDomain: {
      type: Type.STRING,
      description: 'Broad classification domain: "Built Environment" | "Natural World" | "Synthetics & Geometry" | "Humanity" | "Material Artifacts" | "Graphic Culture".',
    },
    subTaxa: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3 to 5 fine-grained sub-taxa classifications.',
    },
    semanticTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '6 to 10 semantic descriptors detailing subjects, lighting, materiality, and emotional resonance.',
    },
    moodAtmosphere: {
      type: Type.STRING,
      description: 'Concise poetic assessment of emotional/aesthetic resonance (e.g. "Severe, contemplative, tactile stillness").',
    },
    colorPalette: {
      type: Type.OBJECT,
      properties: {
        dominantHex: {
          type: Type.STRING,
          description: 'Primary dominant hex code with # prefix.',
        },
        temperature: {
          type: Type.STRING,
          description: '"Warm" | "Cool" | "Neutral" | "Bipolar Contrast"',
        },
        luminance: {
          type: Type.STRING,
          description: '"High-Key Radiant" | "Low-Key Chiaroscuro" | "Balanced Midtone"',
        },
        palette: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              hex: { type: Type.STRING, description: 'Hex code (#rrggbb)' },
              name: { type: Type.STRING, description: 'Curated color name (e.g. "Raw Basalt", "Oxidized Copper", "Bone White")' },
              percentage: { type: Type.NUMBER, description: 'Approximate visual coverage percentage (0 to 100)' },
            },
            required: ['hex', 'name', 'percentage'],
          },
          description: '4 to 6 dominant colors forming the chromatic spectrum.',
        },
      },
      required: ['dominantHex', 'temperature', 'luminance', 'palette'],
    },
    compositionalAttributes: {
      type: Type.OBJECT,
      properties: {
        geometry: {
          type: Type.STRING,
          description: '"Orthogonal Grid" | "Diagonal Vectors" | "Radial Symmetry" | "Organic Fluidity" | "Rule of Thirds" | "Golden Ratio Centered"',
        },
        depthOfField: {
          type: Type.STRING,
          description: '"Shallow Macro" | "Deep Perspective Field" | "Compressed Isometric" | "Planar Graphic Flattening"',
        },
        visualDensity: {
          type: Type.STRING,
          description: '"Minimalist / Void-Heavy" | "Harmonious Equilibrium" | "Intricate / Hyper-Dense"',
        },
        contrastRatio: {
          type: Type.STRING,
          description: '"High-Contrast / Stark" | "Soft Diffused" | "Monochromatic Gradient"',
        },
      },
      required: ['geometry', 'depthOfField', 'visualDensity', 'contrastRatio'],
    },
    detectedEntities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the recognized entity or object.' },
          confidence: { type: Type.NUMBER, description: 'Estimated confidence value from 0.0 to 1.0.' },
          category: { type: Type.STRING, description: 'Taxonomic bucket (e.g. Architecture, Organic, Material, Human, Tool).' },
          focalRelevance: { type: Type.STRING, description: '"primary" | "secondary" | "ambient"' },
        },
        required: ['name', 'confidence', 'category', 'focalRelevance'],
      },
      description: 'Key computer vision detected entities, materials, or focal elements.',
    },
    vectorCoordinates: {
      type: Type.OBJECT,
      properties: {
        x: {
          type: Type.NUMBER,
          description: 'Coordinate from -1.0 (Completely Organic / Biological / Nature) to +1.0 (Completely Synthetic / Architectural / Mechanical).',
        },
        y: {
          type: Type.NUMBER,
          description: 'Coordinate from -1.0 (Strictly Minimal / Void / Negative Space) to +1.0 (Intricate / Dense / Textured / Complex).',
        },
        z: {
          type: Type.NUMBER,
          description: 'Coordinate from -1.0 (Dark / Low-Key / Nocturnal / Chiaroscuro) to +1.0 (Luminous / High-Key / Radiant / Overexposed).',
        },
      },
      required: ['x', 'y', 'z'],
      description: 'Normalized 3D semantic coordinate representation for spatial vector cluster mapping.',
    },
    curatorNotes: {
      type: Type.STRING,
      description: 'Sharp, critical architectural/design critique (2-3 sentences) evaluating composition, material honesty, and semiotic significance in contemporary visual culture.',
    },
  },
  required: [
    'title',
    'primaryCategory',
    'secondaryCategory',
    'macroDomain',
    'subTaxa',
    'semanticTags',
    'moodAtmosphere',
    'colorPalette',
    'compositionalAttributes',
    'detectedEntities',
    'vectorCoordinates',
    'curatorNotes',
  ],
};

// POST /api/analyze-image
app.post('/api/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', imageUrl } = req.body;

    if (!imageBase64 && !imageUrl) {
      return res.status(400).json({ error: 'Either imageBase64 or imageUrl must be provided.' });
    }

    let inlineDataPart: { inlineData: { mimeType: string; data: string } } | null = null;

    if (imageBase64) {
      // Strip data:image/...;base64, prefix if present
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      const cleanMime = imageBase64.includes(',') && imageBase64.startsWith('data:')
        ? imageBase64.split(';')[0].replace('data:', '')
        : mimeType;

      inlineDataPart = {
        inlineData: {
          mimeType: cleanMime || 'image/jpeg',
          data: cleanBase64,
        },
      };
    } else if (imageUrl) {
      // Fetch external image and convert to base64
      const fetched = await fetch(imageUrl);
      if (!fetched.ok) {
        return res.status(400).json({ error: `Failed to fetch image from URL (${fetched.status})` });
      }
      const arrayBuf = await fetched.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      const fetchedMime = fetched.headers.get('content-type') || 'image/jpeg';
      inlineDataPart = {
        inlineData: {
          mimeType: fetchedMime,
          data: buffer.toString('base64'),
        },
      };
    }

    if (!inlineDataPart) {
      return res.status(400).json({ error: 'Unable to process image data.' });
    }

    const systemInstruction = `You are the chief computer vision perception intelligence for SEMANTICA, an avant-garde visual taxonomy archive designed for high-concept art directors, architectural curators, and visual researchers.
Your task is to conduct deep optical and semantic deconstruction of the submitted image specimen.
Accurately identify its overarching category, micro subtaxa, chromatic distribution with hex values, compositional vectors, recognized physical entities, and normalized 3D semantic vector coordinates.
Maintain intellectual rigor, precision, and an elevated editorial perspective (avoid clichés, generic praise, or superficial summaries).`;

    const promptText = `Perform rigorous computer vision semantic categorization on this image specimen. Extract structured taxonomic metadata according to the defined schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [inlineDataPart, { text: promptText }],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.2, // Low temperature for high precision classification
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      return res.status(502).json({ error: 'Empty vision response from model.' });
    }

    const parsed = JSON.parse(textOutput);

    // Call local EmbeddingGemma 170M vision encoder to extract 768-dim visual vector
    try {
      const gemmaVision = await callEmbeddingGemmaVision(inlineDataPart.inlineData.data);
      parsed.embeddingGemmaVector = gemmaVision.vector;
      parsed.encoderSource = gemmaVision.source;
    } catch (e) {
      console.warn('EmbeddingGemma vision encoder non-blocking warning:', e);
    }

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Vision analysis error:', error);
    return res.status(500).json({
      error: error?.message || 'Computer vision semantic categorization failed.',
    });
  }
});

// POST /api/semantic-search
// Natural language semantic search across the gallery's catalog
app.post('/api/semantic-search', async (req: Request, res: Response) => {
  try {
    const { query, items } = req.body;

    if (!query || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Query string and items array are required.' });
    }

    // Prepare compressed items metadata for prompt
    const compressedCatalog = items.map((item: any) => ({
      id: item.id,
      title: item.analysis?.title || item.filename,
      category: item.analysis?.primaryCategory,
      secondary: item.analysis?.secondaryCategory,
      tags: item.analysis?.semanticTags,
      entities: item.analysis?.detectedEntities?.map((e: any) => e.name),
      mood: item.analysis?.moodAtmosphere,
      colors: item.analysis?.colorPalette?.palette?.map((p: any) => p.name),
      geometry: item.analysis?.compositionalAttributes?.geometry,
    }));

    const searchSchema = {
      type: Type.OBJECT,
      properties: {
        queryInterpretation: {
          type: Type.STRING,
          description: 'Concise interpretation of the user’s aesthetic/semantic intent.',
        },
        results: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              score: { type: Type.NUMBER, description: 'Relevance score from 0.0 to 1.0' },
              rationale: { type: Type.STRING, description: '1-sentence crisp explanation of why this specimen matches.' },
            },
            required: ['id', 'score', 'rationale'],
          },
        },
      },
      required: ['queryInterpretation', 'results'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search Query: "${query}"\n\nImage Specimens Metadata:\n${JSON.stringify(compressedCatalog, null, 2)}\n\nRank the specimens according to deep semantic relevance. Filter out scores < 0.35 unless all are low. Sort descending by score.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: searchSchema,
        temperature: 0.1,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty search response from model.' });
    }

    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Semantic search error:', error);
    return res.status(500).json({ error: error?.message || 'Semantic search execution failed.' });
  }
});

// POST /api/curatorial-synthesis
// Generates overarching curatorial critique and taxonomy breakdown
app.post('/api/curatorial-synthesis', async (req: Request, res: Response) => {
  try {
    const { category, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required.' });
    }

    const summary = items.map((i: any) => ({
      title: i.analysis?.title,
      category: i.analysis?.primaryCategory,
      tags: i.analysis?.semanticTags,
      mood: i.analysis?.moodAtmosphere,
      dominantColor: i.analysis?.colorPalette?.dominantHex,
    }));

    const synthesisSchema = {
      type: Type.OBJECT,
      properties: {
        essayTitle: { type: Type.STRING },
        thematicDiscourse: { type: Type.STRING, description: '2 to 3 paragraphs of high-concept editorial critique analyzing the visual tension, materiality, and cultural dialectic of this collection.' },
        chromaticObservations: { type: Type.STRING, description: 'Brief commentary on the color frequency and tonal temperatures.' },
        structuralAxiom: { type: Type.STRING, description: 'A 1-line philosophical axiom summarizing this visual taxonomy.' },
      },
      required: ['essayTitle', 'thematicDiscourse', 'chromaticObservations', 'structuralAxiom'],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Category Focus: ${category || 'Gallery Collective Overview'}\n\nSpecimens:\n${JSON.stringify(summary, null, 2)}\n\nWrite a rigorous curatorial critique in the voice of an avant-garde architectural and visual culture journal.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: synthesisSchema,
        temperature: 0.4,
      },
    });

    const text = response.text;
    if (!text) {
      return res.status(502).json({ error: 'Empty synthesis response.' });
    }

    return res.json({ success: true, data: JSON.parse(text) });
  } catch (error: any) {
    console.error('Curatorial synthesis error:', error);
    return res.status(500).json({ error: error?.message || 'Curatorial synthesis failed.' });
  }
});

// Helper to call the local EmbeddingGemma 170M Vision Encoder with fallback
async function callEmbeddingGemmaVision(imageBase64: string): Promise<{ vector: number[]; source: string; latencyMs: number }> {
  const endpoint = process.env.EMBEDDING_GEMMA_ENDPOINT || 'http://localhost:8000/embed/vision';
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for local service
    const cleanB64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: cleanB64 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.embedding && Array.isArray(data.embedding)) {
        return {
          vector: data.embedding,
          source: 'local_embeddinggemma_170m',
          latencyMs: Date.now() - start,
        };
      }
    }
  } catch (err) {
    // Local microservice offline or not yet started; fallback to Gemini multimodal or deterministic vector
  }

  // Graceful fallback to gemini-embedding-2-preview so the application never breaks
  try {
    const cleanB64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const res = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: [{ inlineData: { mimeType: 'image/jpeg', data: cleanB64 } }],
    });
    const rawValues = (res.embeddings?.[0] as any)?.values || [];
    const vector = rawValues.length >= 768 ? rawValues.slice(0, 768) : rawValues;
    return {
      vector,
      source: 'gemini_multimodal_fallback',
      latencyMs: Date.now() - start,
    };
  } catch (geminiErr) {
    // Deterministic mathematical vector fallback
    const vector: number[] = [];
    const seed = imageBase64.length % 1000;
    for (let i = 0; i < 768; i++) {
      vector.push(Math.sin((i + 1) * seed * 0.013));
    }
    return {
      vector,
      source: 'simulated_fallback',
      latencyMs: Date.now() - start,
    };
  }
}

// GET /api/embeddinggemma/status
// Checks connection to the local 170M vision encoder microservice
app.get('/api/embeddinggemma/status', async (_req: Request, res: Response) => {
  const endpoint = process.env.EMBEDDING_GEMMA_ENDPOINT || 'http://localhost:8000/embed/vision';
  const healthUrl = endpoint.replace('/embed/vision', '/health');
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const ping = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (ping.ok) {
      const data = await ping.json();
      return res.json({
        connected: true,
        endpoint,
        model: data.model || 'EmbeddingGemma-2-170M-Vision',
        device: data.device || 'local',
        latencyMs: Date.now() - start,
      });
    }
  } catch {
    // Offline
  }

  return res.json({
    connected: false,
    endpoint,
    model: 'EmbeddingGemma-2-170M-Vision',
    latencyMs: 0,
    instructions: 'Run `python scripts/serve_embeddinggemma.py` on your machine to bind local weights to http://localhost:8000',
  });
});

// POST /api/embeddinggemma/vision-encode
// Directly invokes the 170M vision encoder on an image
app.post('/api/embeddinggemma/vision-encode', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 payload is required' });
    }

    const result = await callEmbeddingGemmaVision(imageBase64);
    return res.json({
      success: true,
      dimensions: result.vector.length,
      embedding: result.vector,
      source: result.source,
      latencyMs: result.latencyMs,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Vision encoding failed' });
  }
});

// POST /api/embeddinggemma/similarity
// Computes cosine similarity between a query vector and a set of gallery vectors
app.post('/api/embeddinggemma/similarity', (req: Request, res: Response) => {
  try {
    const { targetVector, candidates } = req.body;
    if (!targetVector || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'targetVector and candidates array required' });
    }

    // Cosine similarity
    function cosineSimilarity(a: number[], b: number[]): number {
      let dot = 0;
      let magA = 0;
      let magB = 0;
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
      }
      if (magA === 0 || magB === 0) return 0;
      return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }

    const scored = candidates
      .filter((c: any) => c.embeddingGemmaVector && Array.isArray(c.embeddingGemmaVector))
      .map((c: any) => ({
        id: c.id,
        score: cosineSimilarity(targetVector, c.embeddingGemmaVector),
      }))
      .sort((a: any, b: any) => b.score - a.score);

    return res.json({ success: true, matches: scored });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Similarity calculation failed' });
  }
});

// POST /api/embed-content
// Generates multimodal embeddings using gemini-embedding-2-preview
app.post('/api/embed-content', async (req: Request, res: Response) => {
  try {
    const { text, imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!text && !imageBase64) {
      return res.status(400).json({ error: 'Either text or imageBase64 is required.' });
    }

    const contents: any[] = [];
    if (text) contents.push(text);
    if (imageBase64) {
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      contents.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const result = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents,
    });

    return res.json({ success: true, embeddings: result.embeddings });
  } catch (error: any) {
    console.error('Embedding error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate embeddings.' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SEMANTICA Vision Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
