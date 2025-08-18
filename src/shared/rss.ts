const ALL_ORIGINS = "https://api.allorigins.win/raw?url=";

export async function fetchRss(url: string): Promise<Document> {
  const proxied = `${ALL_ORIGINS}${encodeURIComponent(url)}`;
  const res = await fetch(proxied, { cache: "no-store" });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const text = await res.text();
  return new DOMParser().parseFromString(text, "application/xml");
}

export function rssItems(doc: Document) {
  const items = Array.from(doc.querySelectorAll("item"));
  return items.map((node) => ({
    title: node.querySelector("title")?.textContent?.trim() || "Untitled",
    link: node.querySelector("link")?.textContent?.trim() || "",
    guid: node.querySelector("guid")?.textContent?.trim() || "",
    isoDate: node.querySelector("pubDate")?.textContent
      ? new Date(node.querySelector("pubDate")!.textContent!).toISOString()
      : undefined,
    author:
      node
        .querySelector("dc\\:creator, creator, author")
        ?.textContent?.trim() || undefined,
  }));
}
