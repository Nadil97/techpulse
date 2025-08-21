import { fetchRss, rssItems } from './rss';
import { inferCategories } from './categories';
// TechCrunch RSS
export async function fromTechCrunch() {
    const doc = await fetchRss('https://techcrunch.com/feed/');
    return rssItems(doc).map((i) => ({
        source: 'techcrunch',
        id: i.guid || i.link || i.title,
        title: i.title,
        url: i.link,
        publishedAt: i.isoDate,
        author: i.author,
        categories: inferCategories({ title: i.title, url: i.link, tags: i.tags })
    }));
}
// The Verge RSS (main)
export async function fromTheVerge() {
    const doc = await fetchRss('https://www.theverge.com/rss/index.xml');
    return rssItems(doc).map((i) => ({
        source: 'theverge',
        id: i.guid || i.link || i.title,
        title: i.title,
        url: i.link,
        publishedAt: i.isoDate,
        author: i.author,
        categories: inferCategories({ title: i.title, url: i.link, tags: i.tags })
    }));
}
// Hacker News front page (Algolia – CORS-friendly)
export async function fromHN() {
    const res = await fetch('https://hn.algolia.com/api/v1/search?tags=front_page', { cache: 'no-store' });
    if (!res.ok)
        throw new Error('HN fetch failed');
    const data = await res.json();
    return data.hits.filter(h => h.title).map((h) => ({
        source: 'hn',
        id: h.objectID,
        title: h.title,
        url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
        points: h.points ?? undefined,
        commentsCount: h.num_comments ?? undefined,
        publishedAt: h.created_at,
        categories: inferCategories({ title: h.title, url: h.url })
    }));
}
