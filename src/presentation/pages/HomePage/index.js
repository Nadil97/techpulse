import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import TopNavBar from "../../Componants/TopNavBar";
import NewsCard from "../../Componants/NewsCard";
import TrendingPanel from "../../Componants/TrendingPanel";
import { fromHN, fromTechCrunch, fromTheVerge } from "../../../shared/fetchers";
import { normalizeAndSort } from "../../../shared/normalize";
import { ALL_CATEGORIES } from "../../../shared/types";
import { useBookmarks } from "../../../shared/useBookmarks";
import { bookmarkKey } from "../../../shared/bookmarkKey";
import { analyzeSentiment } from "../../../shared/sentiment";
import "./index.css";
import FloatingBot from "../../Componants/FloatingBot";
export const HomePage = () => {
  const [state, setState] = useState("idle");
  const [items, setItems] = useState([]);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  console.log("clicked js",onlyBookmarks);
  const [timeFilter, setTimeFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [showTrending, setShowTrending] = useState(false);
  console.log("clicked js trending",showTrending);
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
        const all = [
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
    return () => {
      cancelled = true;
    };
  }, []);
  // Local-time boundary for time filtering
  const timeBoundary = useMemo(() => {
    const now = new Date();
    if (timeFilter === "today") {
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
    }
    if (timeFilter === "week") {
      const day = (now.getDay() + 6) % 7; // Monday=0..Sunday=6
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - day
      );
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
      const byCategory =
        categoryFilter === "all" || i.categories.includes(categoryFilter);
      const byQuery = q.trim()
        ? i.title.toLowerCase().includes(q.toLowerCase())
        : true;
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
      return (
        bySource && byCategory && byQuery && byBookmark && bySentiment && byTime
      );
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
  const handleSourceChange = (s) => setSourceFilter(s);
  // Accept string; "" => all
  const handleCategoryChange = (c) => {
    const next = c === "" ? "all" : c;
    setCategoryFilter(next);
  };
  return _jsxs(_Fragment, {
    children: [
      _jsx(TopNavBar, {
        title: "Trending Tech Stories",
        sourceFilter: sourceFilter,
        onSourceChange: handleSourceChange,
        categoryFilter: categoryFilter,
        onCategoryChange: handleCategoryChange,
        q: q,
        onQueryChange: setQ,
        categories: ALL_CATEGORIES,
        isLoading: state === "loading",
      }),
      _jsxs("main", {
        className: "container py-4",
        children: [
          _jsxs("div", {
            className: "d-flex align-items-center justify-content-between mb-3",
            children: [
              _jsx("p", {
                className: "text-muted mb-0",
                children:
                  "Sources: TechCrunch \u00B7 The Verge \u00B7 Hacker News \u2014 client-only via RSS/API",
              }),
              _jsxs("div", {
                className: "controls-bar d-flex align-items-center gap-2",
                children: [
                  _jsxs("button", {
                    type: "button",
                    className: "btn btn-sm btn-outline-secondary d-lg-none",
                    onClick: () => setShowTrending((v) => !v),
                    "aria-expanded": showTrending,
                    "aria-controls": "trending-panel-mobile",
                    title: "Toggle trending panel",
                    children: [
                      _jsx("i", { className: "fa-solid fa-chart-line me-1" }),
                      " Trending",
                    ],
                  }),
                  _jsxs("select", {
                    className: "form-select form-select-sm time-filter",
                    "aria-label": "Time range filter",
                    value: timeFilter,
                    onChange: (e) => setTimeFilter(e.target.value),
                    children: [
                      _jsx("option", { value: "all", children: "Any time" }),
                      _jsx("option", { value: "today", children: "Today" }),
                      _jsx("option", { value: "week", children: "This week" }),
                      _jsx("option", {
                        value: "month",
                        children: "This month",
                      }),
                    ],
                  }),
                  _jsxs("button", {
                    type: "button",
                    className: "bookmark-toggle",
                    onClick: () => setOnlyBookmarks((v) => !v),
                    "aria-pressed": onlyBookmarks,
                    title: onlyBookmarks
                      ? "Show all stories"
                      : "Show only bookmarked",
                    children: [
                      _jsx("span", {
                        className: "icon",
                        "aria-hidden": "true",
                        children: _jsx("i", {
                          className: `${
                            onlyBookmarks ? "fa-solid" : "fa-regular"
                          } fa-bookmark`,
                        }),
                      }),
                      _jsx("span", {
                        className: "label",
                        children: onlyBookmarks
                          ? "Bookmarked"
                          : "Show Bookmarked",
                      }),
                      bookmarks.size > 0 &&
                        _jsx("span", {
                          className: "count",
                          children: bookmarks.size,
                        }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "row g-4",
            children: [
              _jsxs("div", {
                className: "col-lg-8",
                children: [
                  state === "loading" &&
                    _jsx("div", {
                      className: "row g-3",
                      "aria-live": "polite",
                      children: Array.from({ length: 6 }).map((_, i) =>
                        _jsx(
                          "div",
                          {
                            className: "col-md-6 col-lg-6",
                            children: _jsx("div", {
                              className: "card h-100 rounded-4 overflow-hidden",
                              children: _jsxs("div", {
                                className: "card-body",
                                children: [
                                  _jsx("span", {
                                    className:
                                      "placeholder col-6 d-inline-block mb-2",
                                  }),
                                  _jsx("div", {
                                    className:
                                      "placeholder col-12 d-block mb-1",
                                  }),
                                  _jsx("div", {
                                    className: "placeholder col-8 d-block mb-3",
                                  }),
                                  _jsx("div", {
                                    className: "placeholder col-6 d-block",
                                  }),
                                ],
                              }),
                            }),
                          },
                          `ph-${i}`
                        )
                      ),
                    }),
                  state === "error" &&
                    _jsx("div", {
                      className: "alert alert-danger",
                      role: "alert",
                      children: "Failed to load news. Please try again.",
                    }),
                  state === "ready" &&
                    _jsxs("div", {
                      className: "row g-3",
                      "data-testid": "news-grid",
                      children: [
                        filtered.map((item) =>
                          _jsx(
                            "div",
                            {
                              className: "col-md-6 col-lg-6",
                              children: _jsx(NewsCard, { item: item }),
                            },
                            item.id
                          )
                        ),
                        filtered.length === 0 &&
                          _jsx("div", {
                            className: "col-12",
                            children: _jsx("div", {
                              className: "alert alert-warning mb-0",
                              role: "status",
                              children: "No stories match your filters.",
                            }),
                          }),
                      ],
                    }),
                ],
              }),
              _jsxs("div", {
                className: "col-lg-4",
                children: [
                  _jsx("div", {
                    className: "d-none d-lg-block",
                    children: _jsx(TrendingPanel, {
                      items: filtered,
                      bookmarksCount: bookmarks.size,
                      activeCategory:
                        categoryFilter === "all" ? "all" : categoryFilter,
                      activeSentiment:
                        sentimentFilter === "all" ? "all" : sentimentFilter,
                      query: q,
                      onPickCategory: (c) => handleCategoryChange(c),
                      onPickSentiment: (s) => setSentimentFilter(s),
                      onQuery: (qv) => setQ(qv),
                    }),
                  }),
                  _jsx("div", {
                    id: "trending-panel-mobile",
                    className: `d-lg-none ${showTrending ? "" : "d-none"}`,
                    children: _jsx(TrendingPanel, {
                      items: filtered,
                      bookmarksCount: bookmarks.size,
                      activeCategory:
                        categoryFilter === "all" ? "all" : categoryFilter,
                      activeSentiment:
                        sentimentFilter === "all" ? "all" : sentimentFilter,
                      query: q,
                      onPickCategory: (c) => {
                        handleCategoryChange(c);
                        setShowTrending(false);
                      },
                      onPickSentiment: (s) => {
                        setSentimentFilter(s);
                        setShowTrending(false);
                      },
                      onQuery: (qv) => {
                        setQ(qv);
                        setShowTrending(false);
                      },
                      onClose: () => setShowTrending(false),
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsx(FloatingBot, {
        title: "News Assistant",
        accent: "#22c55e",
        welcome: "Hey! \uD83D\uDC4B Need a hand?",
        suggestions: ["Our services", "Get a quote", "Support"],
        onSend: async (text, addBot) => {
          try {
            const resp = await fetch("http://localhost:8788/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                prompt: text,
                history: [
                  { role: "system", content: "You are Trend News Assistant." },
                ],
              }),
            });
            const data = await resp.json();
            addBot(data.reply || "Sorry, I couldn’t come up with an answer.");
          } catch (e) {
            addBot("Network error. Try again in a moment.");
          }
        },
      }),
    ],
  });
};
export default HomePage;
