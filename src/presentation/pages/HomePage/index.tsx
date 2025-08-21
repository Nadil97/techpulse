import { useEffect, useMemo, useState } from "react";
import TopNavBar from "../../../presentation/Componants/TopNavBar";
import NewsCard from "../../../presentation/Componants/NewsCard";
import TrendingPanel from "../../../presentation/Componants/TrendingPanel";
import { fromHN, fromTechCrunch, fromTheVerge } from "../../../shared/fetchers";
import { normalizeAndSort } from "../../../shared/normalize";
import {
  ALL_CATEGORIES,
  Category,
  NewsItem,
  Source,
} from "../../../shared/types";
import { useBookmarks } from "../../../shared/useBookmarks";
import { bookmarkKey } from "../../../shared/bookmarkKey";
import { analyzeSentiment, type Sentiment } from "../../../shared/sentiment";
import "./index.css";
import FloatingBot from "../../Componants/FloatingBot";

type State = "idle" | "loading" | "ready" | "error";
type SourceOption = Source | "all";
type CategoryOption = Category | "all";
type TimeFilter = "all" | "today" | "week" | "month";
type SentimentFilter = "all" | Sentiment;

export const HomePage = () => {
  const [state, setState] = useState<State>("idle");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceOption>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryOption>("all");
  const [q, setQ] = useState("");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>("all");
  const [showTrending, setShowTrending] = useState(false); 

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

  // Local-time boundary for time filtering
  const timeBoundary = useMemo(() => {
    const now = new Date();
    if (timeFilter === "today") {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }
    if (timeFilter === "week") {
      const day = (now.getDay() + 6) % 7; // Monday=0..Sunday=6
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      return start.getTime();
    }
    if (timeFilter === "month") {
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    return null;
  }, [timeFilter]);

  const filtered = useMemo(() => {
    const nowTs = Date.now();
    return items.filter((i) => {
      const bySource = sourceFilter === "all" || i.source === sourceFilter;
      const byCategory = categoryFilter === "all" || i.categories.includes(categoryFilter);
      const byQuery = q.trim() ? i.title.toLowerCase().includes(q.toLowerCase()) : true;
      const byBookmark = !onlyBookmarks || bookmarks.has(bookmarkKey(i));

      // sentiment
      let bySentiment = true;
      if (sentimentFilter !== "all") {
        bySentiment = analyzeSentiment(i.title || "") === sentimentFilter;
      }

      // time
      let byTime = true;
      if (timeBoundary != null) {
        if (!i.publishedAt) byTime = false;
        else {
          const ts = new Date(i.publishedAt).getTime();
          byTime = !Number.isNaN(ts) && ts >= timeBoundary && ts <= nowTs;
        }
      }

      return bySource && byCategory && byQuery && byBookmark && bySentiment && byTime;
    });
  }, [
    items,
    sourceFilter,
    categoryFilter,
    q,
    onlyBookmarks,
    bookmarks,
    timeBoundary,
    sentimentFilter,
  ]);

  const handleSourceChange = (s: SourceOption) => setSourceFilter(s);
  // Accept string; "" => all
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
        {/* Header controls */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <p className="text-muted mb-0">
            Sources: TechCrunch · The Verge · Hacker News — client-only via RSS/API
          </p>

          <div className="controls-bar d-flex align-items-center gap-2">
            {/* Trending panel mobile toggle */}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-lg-none"
              onClick={() => setShowTrending((v) => !v)}
              aria-expanded={showTrending}
              aria-controls="trending-panel-mobile"
              title="Toggle trending panel"
            >
              <i className="fa-solid fa-chart-line me-1" /> Trending
            </button>

            {/* Time filter */}
            <select
              className="form-select form-select-sm time-filter"
              aria-label="Time range filter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            >
              <option value="all">Any time</option>
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
            </select>

            {/* Bookmarked pill toggle */}
            <button
              type="button"
              className="bookmark-toggle"
              onClick={() => setOnlyBookmarks((v) => !v)}
              aria-pressed={onlyBookmarks}
              title={onlyBookmarks ? "Show all stories" : "Show only bookmarked"}
            >
              <span className="icon" aria-hidden="true">
                <i className={`${onlyBookmarks ? "fa-solid" : "fa-regular"} fa-bookmark`} />
              </span>
              <span className="label">
                {onlyBookmarks ? "Bookmarked" : "Show Bookmarked"}
              </span>
              {bookmarks.size > 0 && <span className="count">{bookmarks.size}</span>}
            </button>
          </div>
        </div>

        {/* Main content + Right sidebar */}
        <div className="row g-4">
          {/* Left: news grid */}
          <div className="col-lg-8">
            {state === "loading" && (
              <div className="row g-3" aria-live="polite">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className="col-md-6 col-lg-6" key={`ph-${i}`}>
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
                  <div className="col-md-6 col-lg-6" key={item.id}>
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
          </div>

          {/* Right: Trending panel (sticky on desktop, collapsible on mobile) */}
          <div className="col-lg-4">
            {/* Desktop/tablet */}
            <div className="d-none d-lg-block">
              <TrendingPanel
                items={filtered} // use filtered dataset for relevance
                bookmarksCount={bookmarks.size}
                activeCategory={categoryFilter === "all" ? "all" : (categoryFilter as string)}
                activeSentiment={sentimentFilter === "all" ? "all" : (sentimentFilter as Sentiment)}
                query={q}
                onPickCategory={(c) => handleCategoryChange(c)}              // "" clears to all
                onPickSentiment={(s) => setSentimentFilter(s)}
                onQuery={(qv) => setQ(qv)}
              />
            </div>

            {/* Mobile collapsible */}
            <div id="trending-panel-mobile" className={`d-lg-none ${showTrending ? "" : "d-none"}`}>
              <TrendingPanel
                items={filtered}
                bookmarksCount={bookmarks.size}
                activeCategory={categoryFilter === "all" ? "all" : (categoryFilter as string)}
                activeSentiment={sentimentFilter === "all" ? "all" : (sentimentFilter as Sentiment)}
                query={q}
                onPickCategory={(c) => { handleCategoryChange(c); setShowTrending(false); }}
                onPickSentiment={(s) => { setSentimentFilter(s); setShowTrending(false); }}
                onQuery={(qv) => { setQ(qv); setShowTrending(false); }}
                onClose={() => setShowTrending(false)}
              />
            </div>
          </div>
        </div>
      </main>
      <FloatingBot
            title="News Assistant"
            accent="#22c55e"
            welcome="Hey! 👋 Need a hand?"
            suggestions={["Our services", "Get a quote", "Support"]}
            onSend={async (text, addBot) => {
              try {
                const resp = await fetch("http://localhost:8788/api/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    prompt: text,
                    
                    history: [
                      { role: "system", content: "You are MechSIT Assistant." },
                      
                    ],
                  }),
                });
                const data = await resp.json();
                addBot(data.reply || "Sorry, I couldn’t come up with an answer.");
              } catch (e) {
                addBot("Network error. Try again in a moment.");
              }
            }}
          />
    </>
  );
};

export default HomePage;
