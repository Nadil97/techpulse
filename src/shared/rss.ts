import type { ParsedRssItem } from './types';

// Free CORS proxy (no key). You can swap if needed.
const ALL_ORIGINS = 'https://api.allorigins.win/raw?url=';

export async function fetchRss(url: string): Promise<Document> {
  const proxied = `${ALL_ORIGINS}${encodeURIComponent(url)}`;
  const res = await fetch(proxied, { cache: 'no-store' });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const text = await res.text();
  return new DOMParser().parseFromString(text, 'application/xml');
}

export function rssItems(doc: Document): ParsedRssItem[] {
  const items = Array.from(doc.querySelectorAll('item'));
  return items.map((node) => {
    const tags = Array.from(node.querySelectorAll('category'))
      .map(c => c.textContent?.trim() || '')
      .filter(Boolean);

    const pub = node.querySelector('pubDate')?.textContent || undefined;
    const isoDate = pub ? new Date(pub).toISOString() : undefined;

    return {
      title: node.querySelector('title')?.textContent?.trim() || 'Untitled',
      link: node.querySelector('link')?.textContent?.trim() || '',
      guid: node.querySelector('guid')?.textContent?.trim() || '',
      isoDate,
      author: node.querySelector('dc\\:creator, creator, author')?.textContent?.trim() || undefined,
      tags
    };
  });
}
