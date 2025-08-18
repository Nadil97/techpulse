import type { NewsItem } from "./types";
import { fetchRss, rssItems } from "./rss";

// TechCrunch RSS
export async function fromTechCrunch(): Promise<NewsItem[]> {
  const doc = await fetchRss("https://techcrunch.com/feed/");
  return rssItems(doc).map((i) => ({
    source: "techcrunch",
    id: i.guid || i.link || i.title,
    title: i.title,
    url: i.link,
    publishedAt: i.isoDate,
    author: i.author,
  }));
}

// The Verge RSS (main). Use /tech/rss/index.xml if you want only tech.
export async function fromTheVerge(): Promise<NewsItem[]> {
  const doc = await fetchRss("https://www.theverge.com/rss/index.xml");
  return rssItems(doc).map((i) => ({
    source: "theverge",
    id: i.guid || i.link || i.title,
    title: i.title,
    url: i.link,
    publishedAt: i.isoDate,
    author: i.author,
  }));
}

// Hacker News front page (Algolia – CORS-friendly)
export async function fromHN(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://hn.algolia.com/api/v1/search?tags=front_page",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("HN fetch failed");
  const data = await res.json();
  return (data.hits as any[])
    .filter((h) => h.title)
    .map((h) => ({
      source: "hn",
      id: h.objectID,
      title: h.title,
      url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points ?? undefined,
      commentsCount: h.num_comments ?? undefined,
      publishedAt: h.created_at,
    }));
}
