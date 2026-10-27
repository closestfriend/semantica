import { ImageSpecimen } from '../types/taxonomy';

const DB_NAME = 'semantica_local_gallery';
const DB_VERSION = 1;
const STORE_NAME = 'specimens';

// Seed specimens for initial curated taxonomy
export const SEED_SPECIMENS: ImageSpecimen[] = [
  {
    id: 'seed-01-brutalist',
    filename: 'monolith-cantilever-01.jpg',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 842100,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    dateAdded: '2026-10-10T14:32:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Monolithic Cantilever Elevation',
      primaryCategory: 'Brutalist Architecture',
      secondaryCategory: 'Precast Board-Formed Concrete',
      macroDomain: 'Built Environment',
      subTaxa: ['Béton Brut', 'Geometric Cantilever', 'Orthogonal Shadow Plane', 'Tectonic Mass'],
      semanticTags: ['monolithic', 'concrete', 'brutalism', 'orthogonal', 'hard light', 'heavy mass', 'architectural facade'],
      moodAtmosphere: 'Severe, tectonic stillness with gravitational authority',
      colorPalette: {
        dominantHex: '#3b3e44',
        temperature: 'Cool',
        luminance: 'Balanced Midtone',
        palette: [
          { hex: '#2b2d32', name: 'Raw Basalt', percentage: 42 },
          { hex: '#727782', name: 'Boardform Grey', percentage: 28 },
          { hex: '#b8bcc4', name: 'Bleached Lime', percentage: 16 },
          { hex: '#16181b', name: 'Crevasse Shadow', percentage: 14 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Diagonal Vectors',
        depthOfField: 'Deep Perspective Field',
        visualDensity: 'Minimalist / Void-Heavy',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Concrete Cantilever', confidence: 0.98, category: 'Architecture', focalRelevance: 'primary' },
        { name: 'Deep Shadow Bevel', confidence: 0.94, category: 'Geometry', focalRelevance: 'secondary' },
        { name: 'Sky Void', confidence: 0.91, category: 'Environment', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: 0.88, // Synthetic
        y: -0.65, // Minimal
        z: -0.15, // Mid-tone
      },
      curatorNotes: 'A tour de force of late-modernist tectonics. The sharp diagonal mass defies gravitational equilibrium while the textured concrete surface preserves the ephemeral memory of wooden formwork.',
    },
  },
  {
    id: 'seed-02-botanical',
    filename: 'chlorophyll-membrane-macro.jpg',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 912400,
    width: 1200,
    height: 1600,
    aspectRatio: 0.75,
    dateAdded: '2026-10-10T14:35:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Monstera Chlorophyll Membrane',
      primaryCategory: 'Botanical & Flora',
      secondaryCategory: 'Tropical Foliage Morphology',
      macroDomain: 'Natural World',
      subTaxa: ['Araceae Taxonomy', 'Cellular Venation', 'Fenestration Pattern', 'Photosynthetic Pigment'],
      semanticTags: ['organic', 'chlorophyll', 'emerald green', 'cellular leaf', 'natural curve', 'macro foliage'],
      moodAtmosphere: 'Lush, humid vitality pulsating with microscopic biological order',
      colorPalette: {
        dominantHex: '#1b3a24',
        temperature: 'Neutral',
        luminance: 'Low-Key Chiaroscuro',
        palette: [
          { hex: '#0e2417', name: 'Forest Shadow', percentage: 46 },
          { hex: '#265434', name: 'Emerald Chlorophyll', percentage: 32 },
          { hex: '#5ca26b', name: 'Sunlit Venation', percentage: 14 },
          { hex: '#0a160f', name: 'Midnight Humus', percentage: 8 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Organic Fluidity',
        depthOfField: 'Shallow Macro',
        visualDensity: 'Intricate / Hyper-Dense',
        contrastRatio: 'Soft Diffused',
      },
      detectedEntities: [
        { name: 'Monstera Leaf Blade', confidence: 0.99, category: 'Organic', focalRelevance: 'primary' },
        { name: 'Leaf Rib Veins', confidence: 0.95, category: 'Biology', focalRelevance: 'secondary' },
        { name: 'Dew Droplets', confidence: 0.88, category: 'Water', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: -0.92, // Organic
        y: 0.72, // Complex
        z: -0.35, // Low-key
      },
      curatorNotes: 'Micro-structural botanical poetry. The cellular vascular network mirrors fluvial delta systems, establishing an innate visual resonance between botanical micro-scale and planetary geology.',
    },
  },
  {
    id: 'seed-03-human',
    filename: 'portrait-chiaroscuro-profile.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 780000,
    width: 1200,
    height: 1500,
    aspectRatio: 0.8,
    dateAdded: '2026-10-10T14:40:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Profile in Chiaroscuro Solitude',
      primaryCategory: 'Human Portraiture',
      secondaryCategory: 'Contemporary Editorial Portraiture',
      macroDomain: 'Humanity',
      subTaxa: ['Rembrandt Lighting', 'Cranial Contour', 'Melanin Gradient', 'Psychological Interiority'],
      semanticTags: ['portrait', 'human face', 'chiaroscuro', 'profile', 'dramatic shadow', 'introspective', 'melanin'],
      moodAtmosphere: 'Introspective, solemn grace shrouded in impenetrable velvet darkness',
      colorPalette: {
        dominantHex: '#120f0d',
        temperature: 'Warm',
        luminance: 'Low-Key Chiaroscuro',
        palette: [
          { hex: '#0a0807', name: 'Absolute Obsidian', percentage: 58 },
          { hex: '#63412f', name: 'Umber Contour', percentage: 24 },
          { hex: '#b37754', name: 'Warm Terracotta Specular', percentage: 12 },
          { hex: '#f0c2a2', name: 'Nasal Ridge Highlight', percentage: 6 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Rule of Thirds',
        depthOfField: 'Shallow Macro',
        visualDensity: 'Minimalist / Void-Heavy',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Human Profile', confidence: 0.99, category: 'Human', focalRelevance: 'primary' },
        { name: 'Cheekbone Specular Edge', confidence: 0.92, category: 'Anatomy', focalRelevance: 'secondary' },
        { name: 'Negative Void', confidence: 0.96, category: 'Space', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: -0.65, // Human/Organic
        y: -0.55, // Minimal
        z: -0.82, // Very low-key
      },
      curatorNotes: 'A masterclass in subtractive lighting. By casting eighty percent of the subject into total obscurity, the photographer forces the viewer to interrogate the fragile boundary of identity.',
    },
  },
  {
    id: 'seed-04-abstract',
    filename: 'constructivist-shadows-04.jpg',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 885000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    dateAdded: '2026-10-10T14:45:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Constructivist Shadow Planes',
      primaryCategory: 'Abstract & Geometric',
      secondaryCategory: 'Spatial Hard-Edge Minimal',
      macroDomain: 'Synthetics & Geometry',
      subTaxa: ['Suprematism', 'Hard-Edge Polyhedra', 'Negative Void Intersect', 'Light Falloff Vector'],
      semanticTags: ['abstract', 'geometric', 'sharp lines', 'light and shadow', 'architecture', 'minimalism', 'plane'],
      moodAtmosphere: 'Analytical, mathematical purity stripped of decorative ornament',
      colorPalette: {
        dominantHex: '#f0f1f4',
        temperature: 'Cool',
        luminance: 'High-Key Radiant',
        palette: [
          { hex: '#f4f5f8', name: 'Pristine Plaster', percentage: 52 },
          { hex: '#1c1e22', name: 'Razor Shadow', percentage: 26 },
          { hex: '#8a909a', name: 'Reflected Grey', percentage: 15 },
          { hex: '#c5cbd4', name: 'Ambient Diffusion', percentage: 7 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Diagonal Vectors',
        depthOfField: 'Planar Graphic Flattening',
        visualDensity: 'Minimalist / Void-Heavy',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Geometric Intersection', confidence: 0.97, category: 'Geometry', focalRelevance: 'primary' },
        { name: 'Cast Shadow Triangle', confidence: 0.95, category: 'Optics', focalRelevance: 'secondary' },
        { name: 'Stucco Plane', confidence: 0.91, category: 'Surface', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: 0.94, // Ultra synthetic
        y: -0.88, // Ultra minimal
        z: 0.62, // High-key
      },
      curatorNotes: 'Pure formalist synthesis. The frame transforms an everyday spatial corner into an autonomous abstract composition reminiscent of El Lissitzky’s Proun environments.',
    },
  },
  {
    id: 'seed-05-industrial',
    filename: 'titanium-turbine-hardware.jpg',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 940000,
    width: 1200,
    height: 900,
    aspectRatio: 1.33,
    dateAdded: '2026-10-10T14:50:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Precision Aerospace Rotor Assembly',
      primaryCategory: 'Industrial & Hardware',
      secondaryCategory: 'Aerospace Mechanical Machining',
      macroDomain: 'Synthetics & Geometry',
      subTaxa: ['Five-Axis CNC Milling', 'Aerofoil Hydrodynamics', 'Radial Rotor Blade', 'Sub-Micron Tolerance'],
      semanticTags: ['industrial', 'machinery', 'metal', 'titanium', 'turbine', 'aerospace', 'precision engineering', 'chrome'],
      moodAtmosphere: 'Clinical, unyielding mechanical perfection calibrated to sub-millimeter tolerances',
      colorPalette: {
        dominantHex: '#4a5059',
        temperature: 'Cool',
        luminance: 'Balanced Midtone',
        palette: [
          { hex: '#26292e', name: 'Industrial Graphite', percentage: 38 },
          { hex: '#6b7280', name: 'Milled Titanium', percentage: 34 },
          { hex: '#d1d5db', name: 'Reflective Nickel', percentage: 18 },
          { hex: '#111827', name: 'Crankcase Deep Cavity', percentage: 10 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Radial Symmetry',
        depthOfField: 'Shallow Macro',
        visualDensity: 'Intricate / Hyper-Dense',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Turbine Impeller Blade', confidence: 0.99, category: 'Machinery', focalRelevance: 'primary' },
        { name: 'Central Drive Spindle', confidence: 0.96, category: 'Hardware', focalRelevance: 'secondary' },
        { name: 'Machined Toolpath Grooves', confidence: 0.89, category: 'Texture', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: 0.96, // Synthetic
        y: 0.82, // Hyper dense
        z: 0.12, // Midtone
      },
      curatorNotes: 'An exhilarating demonstration of functionalist aesthetics where form follows extreme thermodynamic necessity. The radial blades create a kinetic vortex even while motionless.',
    },
  },
  {
    id: 'seed-06-typography',
    filename: 'swiss-editorial-specimen.jpg',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 670000,
    width: 1200,
    height: 1600,
    aspectRatio: 0.75,
    dateAdded: '2026-10-10T14:55:00Z',
    status: 'analyzed',
    analysis: {
      title: 'International Typographic System No. 9',
      primaryCategory: 'Typographic & Graphic',
      secondaryCategory: 'Swiss Style Grid Orthodoxy',
      macroDomain: 'Graphic Culture',
      subTaxa: ['Josef Müller-Brockmann Grid', 'Akzidenz Grotesk', 'Rag-Right Alignment', 'Subtractive Letterspacing'],
      semanticTags: ['typography', 'editorial design', 'swiss style', 'book page', 'monochrome print', 'ink on paper', 'layout'],
      moodAtmosphere: 'Disciplined, didactic intellectual lucidity grounded in structural typography',
      colorPalette: {
        dominantHex: '#f5f3ef',
        temperature: 'Warm',
        luminance: 'High-Key Radiant',
        palette: [
          { hex: '#f7f5f0', name: 'Cotton Rag Paper', percentage: 68 },
          { hex: '#1a1816', name: 'Carbon Black Ink', percentage: 22 },
          { hex: '#d94b34', name: 'Swiss Vermilion Accent', percentage: 6 },
          { hex: '#c9c4b8', name: 'Deckle Edge Tint', percentage: 4 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Orthogonal Grid',
        depthOfField: 'Planar Graphic Flattening',
        visualDensity: 'Harmonious Equilibrium',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Display Serif Typography', confidence: 0.98, category: 'Graphic', focalRelevance: 'primary' },
        { name: 'Grid Margin Gutter', confidence: 0.93, category: 'Layout', focalRelevance: 'secondary' },
        { name: 'Offset Ink Bleed', confidence: 0.85, category: 'Material', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: 0.74, // Graphic/Synthetic
        y: -0.32, // Controlled
        z: 0.78, // High-key
      },
      curatorNotes: 'A manifesto of typographic restraint. The tension between the rigid orthogonal baseline grid and the tactile warmth of uncoated cotton paper illustrates the enduring dialectic of modern graphic culture.',
    },
  },
  {
    id: 'seed-07-cosmic',
    filename: 'deep-space-nebula-emission.jpg',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 980000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    dateAdded: '2026-10-10T15:00:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Interstellar Hydrogen Emission Veil',
      primaryCategory: 'Cosmic & Astrophotography',
      secondaryCategory: 'Narrowband Ionized Spectroscopy',
      macroDomain: 'Natural World',
      subTaxa: ['Ionized H-Alpha', 'Proto-Stellar Cloud', 'Diffracted Stellar Spike', 'Relativistic Shock Front'],
      semanticTags: ['space', 'nebula', 'cosmic', 'stars', 'deep space', 'astrophotography', 'cyan and magenta', 'sublime'],
      moodAtmosphere: 'Awe-inspiring, timeless cosmic vastness unburdened by human temporal scale',
      colorPalette: {
        dominantHex: '#080914',
        temperature: 'Cool',
        luminance: 'Low-Key Chiaroscuro',
        palette: [
          { hex: '#03040a', name: 'Cosmic Microwave Void', percentage: 54 },
          { hex: '#1e3a8a', name: 'Ionized Oxygen Blue', percentage: 22 },
          { hex: '#7c3aed', name: 'Ultraviolet Resonance', percentage: 14 },
          { hex: '#ec4899', name: 'Hydrogen Alpha Crimson', percentage: 10 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Organic Fluidity',
        depthOfField: 'Deep Perspective Field',
        visualDensity: 'Intricate / Hyper-Dense',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Ionized Gas Filaments', confidence: 0.99, category: 'Astrophysics', focalRelevance: 'primary' },
        { name: 'Diffraction Star Spikes', confidence: 0.97, category: 'Optics', focalRelevance: 'secondary' },
        { name: 'Dense Molecular Dust Veil', confidence: 0.91, category: 'Cosmic', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: -0.85, // Natural
        y: 0.89, // Dense complexity
        z: -0.74, // Nocturnal void
      },
      curatorNotes: 'Transcending conventional terrestrial representation, this narrowband spectral exposure reveals thermonuclear violence translated into celestial silk.',
    },
  },
  {
    id: 'seed-08-ceramic',
    filename: 'stoneware-vessel-still-life.jpg',
    url: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 730000,
    width: 1200,
    height: 1500,
    aspectRatio: 0.8,
    dateAdded: '2026-10-10T15:05:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Wabi-Sabi Stoneware Vessels in Quietude',
      primaryCategory: 'Still Life & Ceramic',
      secondaryCategory: 'Wood-Fired Anagama Ceramics',
      macroDomain: 'Material Artifacts',
      subTaxa: ['Coarse Chamotte Clay', 'Natural Ash Glaze', 'Asymmetrical Rim', 'Chado Aesthetic'],
      semanticTags: ['ceramics', 'pottery', 'still life', 'wabi-sabi', 'clay', 'earth tones', 'craft', 'quietude'],
      moodAtmosphere: 'Poised, tactile humility celebrating transience, imperfection, and silent domestic ritual',
      colorPalette: {
        dominantHex: '#524338',
        temperature: 'Warm',
        luminance: 'Balanced Midtone',
        palette: [
          { hex: '#3d3027', name: 'Raw Umber Stoneware', percentage: 40 },
          { hex: '#8a7261', name: 'Woodash Patina', percentage: 28 },
          { hex: '#d4c7b8', name: 'Unfinished Linen Ground', percentage: 22 },
          { hex: '#1c1511', name: 'Vessel Interior Cavity', percentage: 10 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Golden Ratio Centered',
        depthOfField: 'Shallow Macro',
        visualDensity: 'Harmonious Equilibrium',
        contrastRatio: 'Soft Diffused',
      },
      detectedEntities: [
        { name: 'Stoneware Vessel', confidence: 0.99, category: 'Craft', focalRelevance: 'primary' },
        { name: 'Ash Glaze Texture', confidence: 0.94, category: 'Material', focalRelevance: 'secondary' },
        { name: 'Cast Shadow Penumbra', confidence: 0.89, category: 'Lighting', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: -0.15, // Hybrid craft
        y: -0.45, // Serene minimalism
        z: 0.05, // Neutral balance
      },
      curatorNotes: 'A meditation on silence. The tactile rough-hewn clay vessel asserts its physical gravity against an atmospheric diffuse light, channeling the wabi-sabi philosophy of Yanagi Soetsu.',
    },
  },
  {
    id: 'seed-09-urban-nocturne',
    filename: 'shibuya-rain-nocturne.jpg',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    sizeBytes: 890000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    dateAdded: '2026-10-10T15:10:00Z',
    status: 'analyzed',
    analysis: {
      title: 'Nocturnal Chromatic Intersection',
      primaryCategory: 'Urban Landscape',
      secondaryCategory: 'Blade Runner Hyper-Metropolis',
      macroDomain: 'Built Environment',
      subTaxa: ['Asphalt Specular Wetness', 'Argon-Neon Reflection', 'Pedestrian Silhouette', 'Atmospheric Vapor'],
      semanticTags: ['urban', 'city at night', 'rain', 'tokyo', 'neon glow', 'asphalt reflections', 'nocturnal', 'cyberpunk'],
      moodAtmosphere: 'Kinetic, alienated electronic pulse under torrential rain reflections',
      colorPalette: {
        dominantHex: '#0c101a',
        temperature: 'Bipolar Contrast',
        luminance: 'Low-Key Chiaroscuro',
        palette: [
          { hex: '#080a10', name: 'Wet Asphalt Black', percentage: 50 },
          { hex: '#ef4444', name: 'Brake Light Crimson', percentage: 20 },
          { hex: '#06b6d4', name: 'Cyan Neon Halation', percentage: 18 },
          { hex: '#fbbf24', name: 'Sodium Vapor Amber', percentage: 12 },
        ],
      },
      compositionalAttributes: {
        geometry: 'Diagonal Vectors',
        depthOfField: 'Deep Perspective Field',
        visualDensity: 'Intricate / Hyper-Dense',
        contrastRatio: 'High-Contrast / Stark',
      },
      detectedEntities: [
        { name: 'Reflective Wet Crosswalk', confidence: 0.98, category: 'Urban', focalRelevance: 'primary' },
        { name: 'Illuminated Neon Signage', confidence: 0.96, category: 'Architecture', focalRelevance: 'secondary' },
        { name: 'Silhouetted Pedestrian Umbrellas', confidence: 0.91, category: 'Human', focalRelevance: 'ambient' },
      ],
      vectorCoordinates: {
        x: 0.78, // Synthetic
        y: 0.75, // Complex
        z: -0.68, // Low-key
      },
      curatorNotes: 'A cinematic symphony of specular optics. The deluge transforms the asphalt roadway into a dual mirror, amplifying neon signifiers into intoxicating chromatic liquidity.',
    },
  },
];

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all specimens
export async function getStoredSpecimens(): Promise<ImageSpecimen[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as ImageSpecimen[];
        if (results && results.length > 0) {
          resolve(results);
        } else {
          // If database is empty, seed with initial specimens
          seedInitialArchive().then(resolve).catch(reject);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB unavailable or failed, fallback to in-memory seeds', err);
    return [...SEED_SPECIMENS];
  }
}

// Save or update single specimen
export async function saveSpecimen(specimen: ImageSpecimen): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(specimen);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Batch save specimens
export async function saveSpecimens(specimens: ImageSpecimen[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const item of specimens) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Delete specimen
export async function deleteSpecimen(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Reset database to seed archive
export async function resetArchiveToSeeds(): Promise<ImageSpecimen[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const seed of SEED_SPECIMENS) {
      store.put(seed);
    }
    tx.oncomplete = () => resolve([...SEED_SPECIMENS]);
    tx.onerror = () => reject(tx.error);
  });
}

// Helper to seed database initially
async function seedInitialArchive(): Promise<ImageSpecimen[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const item of SEED_SPECIMENS) {
      store.put(item);
    }
    tx.oncomplete = () => resolve([...SEED_SPECIMENS]);
    tx.onerror = () => reject(tx.error);
  });
}
