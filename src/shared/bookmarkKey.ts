// Build a stable key for a news item. Prefer canonical URL; fallback to source:id.
import type { NewsItem } from "./types";

export function bookmarkKey(item: NewsItem): string {
  const url = (item.url ?? "").trim();
  if (!url) return `${item.source}:${String(item.id)}`;

  try {
    const u = new URL(url);
    // normalize host + path (lowercase host, remove trailing slash)
    const host = u.host.toLowerCase();
    const path = u.pathname.replace(/\/+$/, "") || "/";
    // keep query but drop tracking params
    const params = new URLSearchParams(u.search);
    const drop = [
      "utm_source","utm_medium","utm_campaign","utm_term","utm_content",
      "gclid","fbclid","igshid","mc_eid","mc_cid","ref"
    ];
    drop.forEach(k => params.delete(k));
    const q = params.toString();
    return `${u.protocol}//${host}${path}${q ? `?${q}` : ""}`;
  } catch {
    // If URL parsing fails, still fallback
    return `${item.source}:${String(item.id)}`;
  }
}
