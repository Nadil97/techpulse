// import { useMemo } from "react";
// import type { NewsItem, Source } from "../../../shared/types";
// import "./index.css";

// type Props = {
//   items: NewsItem[];
//   bookmarksCount?: number;

//   // current selections (for highlighting)
//   activeCategory?: string | "all";
//   activeSource?: Source | "all";

//   onPickCategory: (cat: string) => void;         // pass "" to clear (all)
//   onPickSource: (s: Source | "all") => void;
//   onQuery: (q: string) => void;

//   onClose?: () => void; // mobile close
// };

// const STOP_WORDS = new Set([
//   "the","a","an","and","or","but","of","to","in","for","on","with","by","is","are","was","were",
//   "from","at","as","it","its","be","this","that","these","those","we","you","they","their",
//   "new","how","why","what","when","where","who","will","can","your","our","via","over","than",
//   "more","less","into","about","after","before","up","down","out","off","per","all"
// ]);

// export default function TrendingPanel({
//   items,
//   bookmarksCount = 0,
//   activeCategory = "all",
//   activeSource = "all",
//   onPickCategory,
//   onPickSource,
//   onQuery,
//   onClose,
// }: Props) {
//   const { topCategories, topSources, hotTerms } = useMemo(() => {
//     const catCount = new Map<string, number>();
//     const srcCount = new Map<Source, number>();
//     const termCount = new Map<string, number>();

//     for (const it of items) {
//       (it.categories ?? []).forEach((c) =>
//         catCount.set(c, (catCount.get(c) ?? 0) + 1)
//       );
//       srcCount.set(it.source, (srcCount.get(it.source) ?? 0) + 1);

//       const title = (it.title || "").toLowerCase();
//       for (const raw of title.split(/[^a-z0-9\+\.#-]+/)) {
//         const w = raw.trim();
//         if (!w || w.length < 3) continue;
//         if (STOP_WORDS.has(w)) continue;
//         if (/^\d+$/.test(w)) continue;
//         termCount.set(w, (termCount.get(w) ?? 0) + 1);
//       }
//     }

//     const topCategories = [...catCount.entries()]
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 10)
//       .map(([name, count]) => ({ name, count }));

//     const topSources = [...srcCount.entries()]
//       .sort((a, b) => b[1] - a[1])
//       .map(([name, count]) => ({ name, count }));

//     const hotTerms = [...termCount.entries()]
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 12)
//       .map(([term, count]) => ({ term, count }));

//     return { topCategories, topSources, hotTerms };
//   }, [items]);

//   const isAllCat = !activeCategory || activeCategory === "all";
//   const isAllSrc = activeSource === "all";

//   return (
//     <aside className="trending-panel">
//       <div className="d-flex align-items-center justify-content-between mb-2">
//         <h2 className="h6 m-0">Trending Topics</h2>
//         {onClose && (
//           <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={onClose} aria-label="Close">
//             Close
//           </button>
//         )}
//       </div>

//       {/* KPIs */}
//       <div className="row g-2 mb-3">
//         <div className="col-6">
//           <div className="trend-kpi card card-body py-2">
//             <div className="text-body-secondary small">Stories</div>
//             <div className="fs-5 fw-semibold">{items.length}</div>
//           </div>
//         </div>
//         <div className="col-6">
//           <div className="trend-kpi card card-body py-2">
//             <div className="text-body-secondary small">Bookmarks</div>
//             <div className="fs-5 fw-semibold">{bookmarksCount}</div>
//           </div>
//         </div>
//       </div>

//       {/* Top Categories */}
//       <div className="card mb-3">
//         <div className="card-header py-2 small fw-semibold">Top Categories</div>
//         <div className="card-body py-2">
//           <div className="d-flex flex-wrap gap-2">
//             {/* All chip */}
//             <button
//               className={`btn btn-sm ${isAllCat ? "btn-primary" : "btn-outline-secondary"} trend-chip`}
//               onClick={() => onPickCategory("")} /* "" => clear to all */
//               title="Show all categories"
//             >
//               All
//             </button>

//             {topCategories.length === 0 && (
//               <span className="text-body-secondary small">No categories</span>
//             )}

//             {topCategories.map(({ name, count }) => {
//               const active = activeCategory === name;
//               return (
//                 <button
//                   key={name}
//                   className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"} trend-chip`}
//                   onClick={() => onPickCategory(active ? "" : name)}  /* toggle */
//                   title={`Filter by ${name}`}
//                 >
//                   {name}
//                   <span className="badge text-bg-light ms-2">{count}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Hot in Titles */}
//       <div className="card mb-3">
//         <div className="card-header py-2 small fw-semibold">Hot in titles</div>
//         <ul className="list-group list-group-flush">
//           {hotTerms.length === 0 && (
//             <li className="list-group-item small text-body-secondary">No trending terms</li>
//           )}
//           {hotTerms.map(({ term, count }) => (
//             <li
//               key={term}
//               className="list-group-item d-flex justify-content-between align-items-center py-2 trend-list-item"
//               role="button"
//               onClick={() => onQuery(term)}
//               title={`Search "${term}"`}
//             >
//               <span className="text-truncate">{term}</span>
//               <span className="badge rounded-pill text-bg-secondary">{count}</span>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Sources */}
//       <div className="card">
//         <div className="card-header py-2 small fw-semibold">Sources</div>
//         <ul className="list-group list-group-flush">
//           {topSources.map(({ name, count }) => {
//             const active = activeSource === name;
//             return (
//               <li
//                 key={name}
//                 className={`list-group-item d-flex justify-content-between align-items-center py-2 trend-list-item ${active ? "active" : ""}`}
//                 role="button"
//                 onClick={() => onPickSource(active ? "all" : name)}  /* toggle to all */
//                 title={`Show ${String(name).toUpperCase()}`}
//               >
//                 <span className="text-uppercase">{name}</span>
//                 <span className="badge rounded-pill text-bg-light">{count}</span>
//               </li>
//             );
//           })}
//           <li
//             className={`list-group-item d-flex justify-content-between align-items-center py-2 trend-list-item ${isAllSrc ? "active" : ""}`}
//             role="button"
//             onClick={() => onPickSource("all")}
//             title="Show all sources"
//           >
//             <span>All sources</span>
//             <i className="fa-solid fa-rotate-left" />
//           </li>
//         </ul>
//       </div>
//     </aside>
//   );
// }
import { useMemo } from "react";
import type { NewsItem } from "../../../shared/types";
import { analyzeSentiment, type Sentiment } from "../../../shared/sentiment";
import "./index.css";

type Props = {
  // Pass your *visible/filtered* items here for best relevance
  items: NewsItem[];
  bookmarksCount?: number;

  // current selections (for highlighting & relevance)
  activeCategory?: string | "all";
  activeSentiment?: Sentiment | "all";
  query?: string;

  onPickCategory: (cat: string) => void;             // pass "" to clear (all)
  onPickSentiment: (s: Sentiment | "all") => void;   // toggles handled here
  onQuery: (q: string) => void;

  onClose?: () => void; // mobile close
};

export default function TrendingPanel({
  items,
  bookmarksCount = 0,
  activeCategory = "all",
  activeSentiment = "all",
  query = "",
  onPickCategory,
  onPickSentiment,
  onQuery,
  onClose,
}: Props) {
  // ===== Top Categories
  const topCategories = useMemo(() => {
    const catCount = new Map<string, number>();
    for (const it of items) (it.categories ?? []).forEach((c) => catCount.set(c, (catCount.get(c) ?? 0) + 1));
    return [...catCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  // ===== Related Articles (kept from previous step)
  const related = useMemo(() => {
    const tokens = query
      .toLowerCase()
      .split(/[^a-z0-9\+\.#-]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    let candidates = items;
    if (tokens.length) {
      const matched = items.filter((it) => {
        const t = (it.title || "").toLowerCase();
        return tokens.every((tok) => t.includes(tok));
      });
      if (matched.length) candidates = matched;
    }
    if (activeCategory !== "all") {
      const catFiltered = candidates.filter((it) => it.categories?.includes(activeCategory as any));
      if (catFiltered.length) candidates = catFiltered;
    }

    const sorted = [...candidates].sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      if (tb !== ta) return tb - ta;
      const pa = a.points ?? 0;
      const pb = b.points ?? 0;
      return pb - pa;
    });

    return sorted.slice(0, 6);
  }, [items, activeCategory, query]);

  // ===== Sentiment counts
  const sentimentCounts = useMemo(() => {
    let pos = 0, neu = 0, neg = 0;
    for (const it of items) {
      const s = analyzeSentiment(it.title || "");
      if (s === "positive") pos++;
      else if (s === "negative") neg++;
      else neu++;
    }
    const total = Math.max(1, items.length);
    return {
      pos,
      neu,
      neg,
      pct: {
        pos: (pos / total) * 100,
        neu: (neu / total) * 100,
        neg: (neg / total) * 100,
      },
    };
  }, [items]);

  const isAllCat = !activeCategory || activeCategory === "all";

  // Helper: toggle sentiment (clicking active -> all)
  const onToggleSentiment = (s: Sentiment) => {
    if (activeSentiment === s) onPickSentiment("all");
    else onPickSentiment(s);
  };

  return (
    <aside className="trending-panel">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h2 className="h6 m-0">Trending Topics</h2>
        {onClose && (
          <button className="btn btn-sm btn-outline-secondary d-lg-none" onClick={onClose} aria-label="Close">
            Close
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="row g-2 mb-3">
        <div className="col-6">
          <div className="trend-kpi card card-body py-2">
            <div className="text-body-secondary small">Stories</div>
            <div className="fs-5 fw-semibold">{items.length}</div>
          </div>
        </div>
        <div className="col-6">
          <div className="trend-kpi card card-body py-2">
            <div className="text-body-secondary small">Bookmarks</div>
            <div className="fs-5 fw-semibold">{bookmarksCount}</div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="card mb-3">
        <div className="card-header py-2 small fw-semibold">Top Categories</div>
        <div className="card-body py-2">
          <div className="d-flex flex-wrap gap-2">
            {/* All chip (toggle/clear) */}
            <button
              className={`btn btn-sm ${isAllCat ? "btn-primary" : "btn-outline-secondary"} trend-chip`}
              onClick={() => onPickCategory("")}
              title="Show all categories"
            >
              All
            </button>

            {topCategories.length === 0 && (
              <span className="text-body-secondary small">No categories</span>
            )}

            {topCategories.map(({ name, count }) => {
              const active = activeCategory === name;
              return (
                <button
                  key={name}
                  className={`btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"} trend-chip`}
                  onClick={() => onPickCategory(active ? "" : name)}  /* toggle */
                  title={`Filter by ${name}`}
                >
                  {name}
                  <span className="badge text-bg-light ms-2">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="card mb-3">
        <div className="card-header py-2 small fw-semibold d-flex align-items-center justify-content-between">
          <span>Related articles</span>
          {query && (
            <button className="btn btn-link btn-sm p-0" onClick={() => onQuery("")} title="Clear search">
              Clear search
            </button>
          )}
        </div>
        <ul className="list-group list-group-flush">
          {related.length === 0 && (
            <li className="list-group-item small text-body-secondary">No suggestions</li>
          )}
          {related.map((it) => (
            <li key={it.id} className="list-group-item py-2 related-item">
              <a
                href={it.url}
                target="_blank"
                rel="noreferrer"
                className="related-link"
                title={it.title}
              >
                <div className="related-title text-truncate">{it.title}</div>
                <div className="related-meta small text-body-secondary">
                  <span className="badge text-bg-secondary text-uppercase me-2">{it.source}</span>
                  {it.publishedAt && <span>{new Date(it.publishedAt).toLocaleDateString()}</span>}
                  {it.points != null && <span className="ms-2">▲ {it.points}</span>}
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Sentiment (NEW – replaces Sources) */}
      <div className="card">
        <div className="card-header py-2 small fw-semibold">Article sentiment</div>
        <div className="card-body py-3">
          {/* Stacked bar */}
          <div className="sentiment-bar mb-2" aria-hidden="true">
            <div className="seg pos" style={{ width: `${sentimentCounts.pct.pos}%` }} />
            <div className="seg neu" style={{ width: `${sentimentCounts.pct.neu}%` }} />
            <div className="seg neg" style={{ width: `${sentimentCounts.pct.neg}%` }} />
          </div>

          {/* Chips to filter */}
          <div className="d-flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${activeSentiment === "positive" ? "btn-success" : "btn-outline-success"} trend-chip`}
              onClick={() => onToggleSentiment("positive")}
              title="Show positive"
            >
              Positive <span className="badge text-bg-light ms-2">{sentimentCounts.pos}</span>
            </button>
            <button
              className={`btn btn-sm ${activeSentiment === "neutral" ? "btn-secondary" : "btn-outline-secondary"} trend-chip`}
              onClick={() => onToggleSentiment("neutral")}
              title="Show neutral"
            >
              Neutral <span className="badge text-bg-light ms-2">{sentimentCounts.neu}</span>
            </button>
            <button
              className={`btn btn-sm ${activeSentiment === "negative" ? "btn-danger" : "btn-outline-danger"} trend-chip`}
              onClick={() => onToggleSentiment("negative")}
              title="Show negative"
            >
              Negative <span className="badge text-bg-light ms-2">{sentimentCounts.neg}</span>
            </button>
            {/* Clear */}
            <button
              className={`btn btn-sm ${activeSentiment === "all" ? "btn-primary" : "btn-outline-primary"} trend-chip ms-auto`}
              onClick={() => onPickSentiment("all")}
              title="Show all sentiments"
            >
              All
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
