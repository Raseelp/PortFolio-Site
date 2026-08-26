export interface DemoImage {
  id: string;
  seed: string;
  caption: string;
  tags: string[];
  category: "nature" | "food" | "documents" | "pets" | "tech" | "travel";
  /** Fixed 3D position, hand-placed to read like a real UMAP cluster layout. */
  position: [number, number, number];
}

export const categoryMeta: Record<
  DemoImage["category"],
  { label: string; color: string }
> = {
  nature: { label: "Nature", color: "#17b893" },
  food: { label: "Food", color: "#ff6b4a" },
  documents: { label: "Documents", color: "#f5a623" },
  pets: { label: "Pets", color: "#4cc9f0" },
  tech: { label: "Tech", color: "#8b7cf6" },
  travel: { label: "Travel", color: "#f472b6" },
};

export const demoImages: DemoImage[] = [
  {
    id: "mountain-sunrise-trail",
    seed: "mountain-sunrise-trail",
    caption: "Sunrise over a mountain hiking trail",
    tags: ["mountain", "sunrise", "hiking", "trail", "nature", "landscape"],
    category: "nature",
    position: [1.4, 1.1, 0.6],
  },
  {
    id: "forest-trail-fog",
    seed: "forest-trail-fog",
    caption: "A foggy trail winding through a pine forest",
    tags: ["forest", "fog", "trail", "pine", "nature", "hike", "woods"],
    category: "nature",
    position: [2.1, 0.5, -0.1],
  },
  {
    id: "mountain-lake-reflection",
    seed: "mountain-lake-reflection",
    caption: "A calm lake reflecting snow-capped mountains",
    tags: ["mountain", "lake", "reflection", "water", "nature", "landscape"],
    category: "nature",
    position: [1.9, 1.0, 0.9],
  },
  {
    id: "birthday-cake-candles",
    seed: "birthday-cake-candles",
    caption: "A birthday cake with lit candles",
    tags: ["cake", "birthday", "candles", "celebration", "dessert", "food"],
    category: "food",
    position: [-2.1, -0.3, 0.9],
  },
  {
    id: "pizza-slice-table",
    seed: "pizza-slice-table",
    caption: "A slice of pizza on a wooden table",
    tags: ["pizza", "food", "table", "slice", "meal", "cheese"],
    category: "food",
    position: [-1.5, -0.9, 0.3],
  },
  {
    id: "coffee-cup-desk",
    seed: "coffee-cup-desk",
    caption: "A cup of coffee next to a laptop on a desk",
    tags: ["coffee", "desk", "laptop", "workspace", "morning", "drink"],
    category: "food",
    position: [-1.9, -0.5, 1.0],
  },
  {
    id: "electronics-store-receipt",
    seed: "electronics-store-receipt",
    caption: "A printed receipt from an electronics store",
    tags: ["receipt", "invoice", "document", "electronics", "store", "paper", "tax"],
    category: "documents",
    position: [-0.2, -1.6, -0.5],
  },
  {
    id: "whiteboard-notes-meeting",
    seed: "whiteboard-notes-meeting",
    caption: "A whiteboard covered in meeting notes and diagrams",
    tags: ["whiteboard", "notes", "meeting", "diagram", "document", "office", "sketch"],
    category: "documents",
    position: [0.5, -2.0, -1.1],
  },
  {
    id: "invoice-tax-document",
    seed: "invoice-tax-document",
    caption: "A tax invoice with itemized charges",
    tags: ["invoice", "tax", "document", "receipt", "charges", "paper", "bill"],
    category: "documents",
    position: [0.3, -1.5, -1.0],
  },
  {
    id: "golden-retriever-park",
    seed: "golden-retriever-park",
    caption: "A golden retriever playing fetch in the park",
    tags: ["dog", "golden retriever", "park", "pet", "playing", "fetch"],
    category: "pets",
    position: [-0.7, 1.9, -0.6],
  },
  {
    id: "cat-windowsill-sunlight",
    seed: "cat-windowsill-sunlight",
    caption: "A cat napping on a windowsill in the sunlight",
    tags: ["cat", "pet", "windowsill", "sunlight", "nap", "sleeping"],
    category: "pets",
    position: [-0.1, 1.4, -1.2],
  },
  {
    id: "puppy-grass-portrait",
    seed: "puppy-grass-portrait",
    caption: "A puppy sitting in the grass looking at the camera",
    tags: ["puppy", "dog", "grass", "pet", "portrait", "cute"],
    category: "pets",
    position: [-0.5, 1.7, -1.0],
  },
  {
    id: "laptop-code-screen",
    seed: "laptop-code-screen",
    caption: "A laptop screen showing lines of code",
    tags: ["laptop", "code", "screen", "programming", "developer", "tech", "software"],
    category: "tech",
    position: [1.3, -0.1, -1.3],
  },
  {
    id: "circuit-board-macro",
    seed: "circuit-board-macro",
    caption: "A close-up of a circuit board",
    tags: ["circuit", "board", "electronics", "tech", "hardware", "macro"],
    category: "tech",
    position: [1.9, -0.6, -1.9],
  },
  {
    id: "desk-setup-monitor",
    seed: "desk-setup-monitor",
    caption: "A desk setup with a monitor and mechanical keyboard",
    tags: ["desk", "monitor", "keyboard", "setup", "tech", "workspace"],
    category: "tech",
    position: [1.7, -0.2, -1.5],
  },
  {
    id: "airport-terminal-travel",
    seed: "airport-terminal-travel",
    caption: "Passengers walking through an airport terminal",
    tags: ["airport", "travel", "terminal", "passengers", "flight"],
    category: "travel",
    position: [-1.9, 0.5, 1.3],
  },
  {
    id: "beach-sunset-waves",
    seed: "beach-sunset-waves",
    caption: "Waves rolling onto the beach at sunset",
    tags: ["beach", "sunset", "waves", "ocean", "sand", "travel"],
    category: "travel",
    position: [-1.3, -0.1, 1.9],
  },
  {
    id: "city-skyline-night",
    seed: "city-skyline-night",
    caption: "City skyline lit up at night",
    tags: ["city", "skyline", "night", "lights", "buildings", "urban", "travel"],
    category: "travel",
    position: [-1.7, 0.3, 1.5],
  },
];

export const demoQuerySuggestions = [
  "receipt from a store",
  "dog in the park",
  "mountain landscape",
  "birthday cake",
  "laptop with code on screen",
  "sunset by the water",
];

export function imageUrl(seed: string, size = 400) {
  return `https://picsum.photos/seed/${seed}/${size}/${size}`;
}
