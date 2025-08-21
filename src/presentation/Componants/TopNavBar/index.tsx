import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import "./index.css";

type SourceOption = "all" | "techcrunch" | "theverge" | "hn";
type CategoryValue = "all" | string;
type Theme = "light" | "dark";

type Props = {
  title?: string;
  sourceFilter: SourceOption;
  onSourceChange: (s: SourceOption) => void;
  categoryFilter: CategoryValue;
  onCategoryChange: (c: string) => void;
  q: string;
  onQueryChange: (q: string) => void;
  categories: readonly string[];
  sources?: readonly SourceOption[];
  isLoading?: boolean;
};

const THEME_KEY = "theme";

export default function TopNavBar({
  title = "Trending Tech Stories",
  sourceFilter,
  onSourceChange,
  categoryFilter,
  onCategoryChange,
  q,
  onQueryChange,
  categories,
  sources,
  isLoading = false,
}: Props) {
  const sourceOptions = useMemo<readonly SourceOption[]>(
    () => sources ?? (["all", "techcrunch", "theverge", "hn"] as const),
    [sources]
  );

  // Default DARK theme
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    return stored ?? "dark";
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);
  const toggleSearch = () => setSearchOpen((v) => !v);
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setSearchOpen(false);
  };

  return (
    <header className="topnav shadow-sm">
      <div className="container topnav__inner">
        {/* Row 1: Title + Theme toggle */}
        <div className="topnav__row1">
          <h1 className="topnav__title m-0">{title}</h1>

          <button
            type="button"
            className="btn btn-sm btn-outline-secondary topnav__themeToggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <i
              className={`fa-solid ${theme === "dark" ? "fa-moon" : "d-none"}`}
            />
            <i
              className={`fa-regular fa-sun ${
                theme === "dark" ? "d-none" : ""
              }`}
            />
          </button>
        </div>

        {/* Row 2 (ONE LINE): Category | Search | Sources */}
        <div className="topnav__row2 topnav__row2--one">
          {/* Category */}
          <select
            className="form-select form-select-sm topnav__category"
            value={categoryFilter === "all" ? "" : categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Category filter"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Search (icon ↔ input) */}
          <div className="topnav__searchFlex">
            {!searchOpen ? (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm topnav__searchBtn w-100"
                onClick={toggleSearch}
                aria-label="Open search"
                title="Search"
              >
                <i className="fa-solid fa-magnifying-glass me-1" />
                <span className="d-none d-md-inline">Search</span>
              </button>
            ) : (
              <div className="input-group input-group-sm topnav__searchGroup">
                <span className="input-group-text">
                  <i className="fa-solid fa-magnifying-glass" />
                </span>
                <input
                  ref={inputRef}
                  className="form-control"
                  placeholder="Search title…"
                  value={q}
                  onChange={(e) => onQueryChange(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  aria-label="Search stories by title"
                />
                {q && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => onQueryChange("")}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={toggleSearch}
                  aria-label="Close search"
                  title="Close (Esc)"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Sources (scrollable pills, right) */}
          <div
            className="topnav__scroller btn-group"
            role="group"
            aria-label="Source filter"
          >
            {sourceOptions.map((s) => {
              const active = sourceFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  className={`btn btn-sm ${
                    active ? "btn-primary" : "btn-outline-primary"
                  }`}
                  onClick={() => onSourceChange(s)}
                >
                  {s.toUpperCase()}
                </button>
              );
            })}
          </div>

          {isLoading && (
            <div
              className="spinner-border spinner-border-sm text-secondary ms-2"
              role="status"
              aria-label="Loading…"
            />
          )}
        </div>
      </div>
    </header>
  );
}
