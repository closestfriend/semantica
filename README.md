# semantica

Algorithmic vision taxonomy and spatial embedding explorer built with React 19, Vite, Tailwind CSS v4, Express, and `@google/genai` (`EmbeddingGemma`).

## Overview

`semantica` indexes algorithmic vision specimens across structural, operational, and epistemic axes, pairing structured multimodal extraction with dense vector embeddings for two-dimensional spatial projection.

- **Taxonomic Matrix**: Categorizes vision pipelines by sensing regime, representation model, and failure signature.
- **Spatial Vector Map**: Computes cosine similarity across `EmbeddingGemma` embeddings to project specimens into an interactive 2D neighborhood graph.
- **Express Backend (`server.ts`)**: Handles structured vision analysis and embedding generation requests without exposing API credentials to the client bundle.

## Quickstart

```bash
npm install
cp .env.example .env   # set GEMINI_API_KEY
npm run dev            # starts Express + Vite server on http://localhost:3000
```

## Build & Typecheck

```bash
npm run lint           # tsc --noEmit
npm run build          # production bundle in dist/
```
