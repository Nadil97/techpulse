import { useEffect, useMemo, useState } from "react";
import TopNavBar from "../../../presentation/Componants/TopNavBar";
import NewsCard from "../../../presentation/Componants/NewsCard";
import { fromHN, fromTechCrunch, fromTheVerge } from "../../../shared/fetchers";
import { normalizeAndSort } from "../../../shared/normalize";
import { ALL_CATEGORIES, Category, NewsItem, Source } from "../../../shared/types";
import { useBookmarks } from "../../../shared/useBookmarks";
import { bookmarkKey } from "../../../shared/bookmarkKey";

type State = "idle" | "loading" | "ready" | "error";
type SourceOption = Source | "all";
type CategoryOption = Category | "all";

export const HomePage = () => {
  const [state, setState] = useState<State>("idle");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceOption>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryOption>("all");
  const [q, setQ] = useState("");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const { bookmarks } = useBookmarks();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState("loading");
      try {
        const [tc, verge, hn] = await Promise.allSettled([
          fromTechCrunch(),
          fromTheVerge(),
          fromHN(),
        ]);

        const all: NewsItem[] = [
          ...(tc.status === "fulfilled" ? tc.value : []),
          ...(verge.status === "fulfilled" ? verge.value : []),
          ...(hn.status === "fulfilled" ? hn.value : []),
        ];

        if (!cancelled) {
          setItems(normalizeAndSort(all).slice(0, 80));
          setState("ready");
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const bySource = sourceFilter === "all" || i.source === sourceFilter;
      const byCategory = categoryFilter === "all" || i.categories.includes(categoryFilter);
      const byQuery = q.trim() ? i.title.toLowerCase().includes(q.toLowerCase()) : true;
      const key = bookmarkKey(i);
      const byBookmark = !onlyBookmarks || bookmarks.has(key) || bookmarks.has(String(i.id)); // legacy fallback
      return bySource && byCategory && byQuery && byBookmark;
    });
  }, [items, sourceFilter, categoryFilter, q, onlyBookmarks, bookmarks]);

  const handleSourceChange = (s: SourceOption) => setSourceFilter(s);
  const handleCategoryChange = (c: string) => {
    const next: CategoryOption = c === "" ? "all" : (c as Category);
    setCategoryFilter(next);
  };

  return (
    <>
      <TopNavBar
        title="Trending Tech Stories"
        sourceFilter={sourceFilter}
        onSourceChange={handleSourceChange}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        q={q}
        onQueryChange={setQ}
        categories={ALL_CATEGORIES}
        isLoading={state === "loading"}
      />

      <main className="container py-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <p className="text-muted mb-0">
            Sources: TechCrunch · The Verge · Hacker News — client-only via RSS/API
          </p>

          {/* Show Bookmarked toggle button (right side) */}
          <button
            type="button"
            className={`btn btn-sm ${onlyBookmarks ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setOnlyBookmarks(v => !v)}
            aria-pressed={onlyBookmarks}
            title={onlyBookmarks ? "Show all stories" : "Show only bookmarked"}
          >
            <i className={`${onlyBookmarks ? "fa-solid" : "fa-regular"} fa-bookmark me-2`} />
            {onlyBookmarks ? "Show All" : `Show Bookmarked${bookmarks.size ? ` (${bookmarks.size})` : ""}`}
          </button>
        </div>

        {state === "loading" && (
          <div className="row g-3" aria-live="polite">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="col-md-6 col-lg-4" key={`ph-${i}`}>
                <div className="card h-100 rounded-4 overflow-hidden">
                  <div className="card-body">
                    <span className="placeholder col-6 d-inline-block mb-2" />
                    <div className="placeholder col-12 d-block mb-1" />
                    <div className="placeholder col-8 d-block mb-3" />
                    <div className="placeholder col-6 d-block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {state === "error" && (
          <div className="alert alert-danger" role="alert">
            Failed to load news. Please try again.
          </div>
        )}

        {state === "ready" && (
          <div className="row g-3" data-testid="news-grid">
            {filtered.map((item) => (
              <div className="col-md-6 col-lg-4" key={item.id}>
                <NewsCard item={item} />
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="col-12">
                <div className="alert alert-warning mb-0" role="status">
                  No stories match your filters.
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default HomePage;
