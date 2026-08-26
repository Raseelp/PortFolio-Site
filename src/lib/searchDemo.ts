import { categoryMeta, demoImages, type DemoImage } from "./demoImages";

// A small synonym table so the demo tolerates the way people actually phrase
// a query, without needing a real embedding model behind it. Keys map to
// every word in the value list and vice versa.
const SYNONYM_GROUPS: string[][] = [
  ["photo", "picture", "image", "shot", "snap"],
  ["store", "shop", "shopping"],
  ["bill", "invoice", "receipt"],
  ["dog", "puppy", "retriever", "canine"],
  ["cat", "kitten", "feline"],
  ["cake", "dessert", "sweet"],
  ["ocean", "sea", "waves", "water"],
  ["code", "programming", "software", "coding", "developer"],
  ["city", "urban", "skyline", "downtown"],
  ["night", "evening", "dark"],
  ["computer", "laptop", "monitor", "screen"],
  ["desk", "workspace", "office"],
  ["meal", "food", "eating", "lunch", "dinner"],
  ["drink", "beverage"],
  ["mountain", "mountains", "peak", "summit"],
  ["hike", "hiking", "trail", "trek"],
  ["flight", "airplane", "plane", "flying"],
  ["sunset", "dusk", "twilight"],
  ["circuit", "electronics", "hardware", "chip"],
  ["document", "paperwork", "documents", "invoice", "receipt"],
];

const STOPWORDS = new Set([
  "a", "an", "the", "of", "in", "on", "at", "with", "by", "from", "to",
  "and", "or", "is", "are", "some", "my", "me", "for", "this", "that",
  "picture", "photo", "image", "photos", "pictures", "images",
]);

function stem(word: string): string {
  // A deliberately small stemmer: strip common plural/gerund endings so
  // "mountains" reaches "mountain" and "playing" reaches "play" without
  // pulling in a real NLP dependency for a client-side demo.
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function tokenize(text: string, dropStopwords: boolean): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const filtered = dropStopwords ? words.filter((w) => !STOPWORDS.has(w)) : words;
  return filtered.map(stem).filter((w) => w.length > 1);
}

function expand(tokens: string[]): Set<string> {
  const out = new Set(tokens);
  for (const token of tokens) {
    for (const group of SYNONYM_GROUPS) {
      const stemmedGroup = group.map(stem);
      if (stemmedGroup.includes(token)) {
        stemmedGroup.forEach((w) => out.add(w));
      }
    }
  }
  return out;
}

export interface SearchResult {
  image: DemoImage;
  score: number;
}

/**
 * Client-side keyword scorer that stands in for the real CLIP-based
 * retrieval pipeline described in the case study below. It compares the
 * query directly against each image's real caption and tags, so results
 * are accurate to the demo data, not random — a real embedding model would
 * generalize further, but the matching itself is not faked.
 */
export function runDemoSearch(query: string): SearchResult[] {
  const rawTokens = tokenize(query, true);
  if (rawTokens.length === 0) return [];
  const queryTokens = expand(rawTokens);

  const scored = demoImages.map((image) => {
    const categoryTokens = expand(tokenize(categoryMeta[image.category].label, false));
    const tagTokens = expand(tokenize(image.tags.join(" "), false));
    const captionTokens = expand(tokenize(image.caption, true));

    let score = 0;
    let matchedCount = 0;

    for (const token of queryTokens) {
      let bestForToken = 0;
      if (categoryTokens.has(token)) bestForToken = Math.max(bestForToken, 2.5);
      if (tagTokens.has(token)) bestForToken = Math.max(bestForToken, 3);
      if (captionTokens.has(token)) bestForToken = Math.max(bestForToken, 1.5);
      if (bestForToken === 0) {
        // Partial credit for a stem-level near match, e.g. "beaches" vs "beach".
        const haystack = [...tagTokens, ...captionTokens, ...categoryTokens];
        if (haystack.some((h) => h.length > 3 && (h.startsWith(token) || token.startsWith(h)))) {
          bestForToken = 1;
        }
      }
      if (bestForToken > 0) {
        score += bestForToken;
        matchedCount += 1;
      }
    }

    // Reward covering more of the query, not just any single strong hit,
    // so "dog in the park" ranks the photo that matches both words above
    // one that only matches "dog".
    const coverage = matchedCount / queryTokens.size;
    return { image, score: score * (0.5 + 0.5 * coverage) };
  });

  return scored
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
