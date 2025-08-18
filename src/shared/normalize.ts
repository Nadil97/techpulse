import type { NewsItem } from "./types";

const canonical = (u: string) => u.replace(/(\?|#).*$/, "");

export function normalizeAndSort(items: NewsItem[]): NewsItem[] {
  const uniq: Record<string, NewsItem> = {};
  for (const it of items) {
    const key = canonical(it.url || it.id);
    if (!uniq[key]) uniq[key] = it;
  }
  const arr = Object.values(uniq);

  return arr.sort((a, b) => {
    const ap = a.points ?? 0;
    const bp = b.points ?? 0;
    if (ap !== bp) return bp - ap;
    const ad = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bd = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bd - ad;
  });
}
