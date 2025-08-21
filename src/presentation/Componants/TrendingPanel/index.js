import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { analyzeSentiment } from "../../../shared/sentiment";
import "./index.css";
export default function TrendingPanel({ items, bookmarksCount = 0, activeCategory = "all", activeSentiment = "all", query = "", onPickCategory, onPickSentiment, onQuery, onClose, }) {
    // ===== Top Categories
    const topCategories = useMemo(() => {
        const catCount = new Map();
        for (const it of items)
            (it.categories ?? []).forEach((c) => catCount.set(c, (catCount.get(c) ?? 0) + 1));
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
            if (matched.length)
                candidates = matched;
        }
        if (activeCategory !== "all") {
            const catFiltered = candidates.filter((it) => it.categories?.includes(activeCategory));
            if (catFiltered.length)
                candidates = catFiltered;
        }
        const sorted = [...candidates].sort((a, b) => {
            const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
            const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
            if (tb !== ta)
                return tb - ta;
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
            if (s === "positive")
                pos++;
            else if (s === "negative")
                neg++;
            else
                neu++;
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
    const onToggleSentiment = (s) => {
        if (activeSentiment === s)
            onPickSentiment("all");
        else
            onPickSentiment(s);
    };
    return (_jsxs("aside", { className: "trending-panel", children: [_jsxs("div", { className: "d-flex align-items-center justify-content-between mb-2", children: [_jsx("h2", { className: "h6 m-0", children: "Trending Topics" }), onClose && (_jsx("button", { className: "btn btn-sm btn-outline-secondary d-lg-none", onClick: onClose, "aria-label": "Close", children: "Close" }))] }), _jsxs("div", { className: "row g-2 mb-3", children: [_jsx("div", { className: "col-6", children: _jsxs("div", { className: "trend-kpi card card-body py-2", children: [_jsx("div", { className: "text-body-secondary small", children: "Stories" }), _jsx("div", { className: "fs-5 fw-semibold", children: items.length })] }) }), _jsx("div", { className: "col-6", children: _jsxs("div", { className: "trend-kpi card card-body py-2", children: [_jsx("div", { className: "text-body-secondary small", children: "Bookmarks" }), _jsx("div", { className: "fs-5 fw-semibold", children: bookmarksCount })] }) })] }), _jsxs("div", { className: "card mb-3", children: [_jsx("div", { className: "card-header py-2 small fw-semibold", children: "Top Categories" }), _jsx("div", { className: "card-body py-2", children: _jsxs("div", { className: "d-flex flex-wrap gap-2", children: [_jsx("button", { className: `btn btn-sm ${isAllCat ? "btn-primary" : "btn-outline-secondary"} trend-chip`, onClick: () => onPickCategory(""), title: "Show all categories", children: "All" }), topCategories.length === 0 && (_jsx("span", { className: "text-body-secondary small", children: "No categories" })), topCategories.map(({ name, count }) => {
                                    const active = activeCategory === name;
                                    return (_jsxs("button", { className: `btn btn-sm ${active ? "btn-primary" : "btn-outline-secondary"} trend-chip`, onClick: () => onPickCategory(active ? "" : name), title: `Filter by ${name}`, children: [name, _jsx("span", { className: "badge text-bg-light ms-2", children: count })] }, name));
                                })] }) })] }), _jsxs("div", { className: "card mb-3", children: [_jsxs("div", { className: "card-header py-2 small fw-semibold d-flex align-items-center justify-content-between", children: [_jsx("span", { children: "Related articles" }), query && (_jsx("button", { className: "btn btn-link btn-sm p-0", onClick: () => onQuery(""), title: "Clear search", children: "Clear search" }))] }), _jsxs("ul", { className: "list-group list-group-flush", children: [related.length === 0 && (_jsx("li", { className: "list-group-item small text-body-secondary", children: "No suggestions" })), related.map((it) => (_jsx("li", { className: "list-group-item py-2 related-item", children: _jsxs("a", { href: it.url, target: "_blank", rel: "noreferrer", className: "related-link", title: it.title, children: [_jsx("div", { className: "related-title text-truncate", children: it.title }), _jsxs("div", { className: "related-meta small text-body-secondary", children: [_jsx("span", { className: "badge text-bg-secondary text-uppercase me-2", children: it.source }), it.publishedAt && _jsx("span", { children: new Date(it.publishedAt).toLocaleDateString() }), it.points != null && _jsxs("span", { className: "ms-2", children: ["\u25B2 ", it.points] })] })] }) }, it.id)))] })] }), _jsxs("div", { className: "card", children: [_jsx("div", { className: "card-header py-2 small fw-semibold", children: "Article sentiment" }), _jsxs("div", { className: "card-body py-3", children: [_jsxs("div", { className: "sentiment-bar mb-2", "aria-hidden": "true", children: [_jsx("div", { className: "seg pos", style: { width: `${sentimentCounts.pct.pos}%` } }), _jsx("div", { className: "seg neu", style: { width: `${sentimentCounts.pct.neu}%` } }), _jsx("div", { className: "seg neg", style: { width: `${sentimentCounts.pct.neg}%` } })] }), _jsxs("div", { className: "d-flex flex-wrap gap-2", children: [_jsxs("button", { className: `btn btn-sm ${activeSentiment === "positive" ? "btn-success" : "btn-outline-success"} trend-chip`, onClick: () => onToggleSentiment("positive"), title: "Show positive", children: ["Positive ", _jsx("span", { className: "badge text-bg-light ms-2", children: sentimentCounts.pos })] }), _jsxs("button", { className: `btn btn-sm ${activeSentiment === "neutral" ? "btn-secondary" : "btn-outline-secondary"} trend-chip`, onClick: () => onToggleSentiment("neutral"), title: "Show neutral", children: ["Neutral ", _jsx("span", { className: "badge text-bg-light ms-2", children: sentimentCounts.neu })] }), _jsxs("button", { className: `btn btn-sm ${activeSentiment === "negative" ? "btn-danger" : "btn-outline-danger"} trend-chip`, onClick: () => onToggleSentiment("negative"), title: "Show negative", children: ["Negative ", _jsx("span", { className: "badge text-bg-light ms-2", children: sentimentCounts.neg })] }), _jsx("button", { className: `btn btn-sm ${activeSentiment === "all" ? "btn-primary" : "btn-outline-primary"} trend-chip ms-auto`, onClick: () => onPickSentiment("all"), title: "Show all sentiments", children: "All" })] })] })] })] }));
}
