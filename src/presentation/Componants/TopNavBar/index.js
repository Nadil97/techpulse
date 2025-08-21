import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState, } from "react";
import "./index.css";
const THEME_KEY = "theme";
export default function TopNavBar({ title = "Trending Tech Stories", sourceFilter, onSourceChange, categoryFilter, onCategoryChange, q, onQueryChange, categories, sources, isLoading = false, }) {
    const sourceOptions = useMemo(() => sources ?? ["all", "techcrunch", "theverge", "hn"], [sources]);
    // Default DARK theme
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem(THEME_KEY);
        return stored ?? "dark";
    });
    useEffect(() => {
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
    }, [theme]);
    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
    const [searchOpen, setSearchOpen] = useState(false);
    const inputRef = useRef(null);
    useEffect(() => {
        if (searchOpen)
            inputRef.current?.focus();
    }, [searchOpen]);
    const toggleSearch = () => setSearchOpen((v) => !v);
    const onSearchKeyDown = (e) => {
        if (e.key === "Escape")
            setSearchOpen(false);
    };
    return (_jsx("header", { className: "topnav shadow-sm", children: _jsxs("div", { className: "container topnav__inner", children: [_jsxs("div", { className: "topnav__row1", children: [_jsx("h1", { className: "topnav__title m-0", children: title }), _jsxs("button", { type: "button", className: "btn btn-sm btn-outline-secondary topnav__themeToggle", onClick: toggleTheme, "aria-label": theme === "dark" ? "Switch to light mode" : "Switch to dark mode", title: theme === "dark" ? "Light mode" : "Dark mode", children: [_jsx("i", { className: `fa-solid ${theme === "dark" ? "fa-moon" : "d-none"}` }), _jsx("i", { className: `fa-regular fa-sun ${theme === "dark" ? "d-none" : ""}` })] })] }), _jsxs("div", { className: "topnav__row2 topnav__row2--one", children: [_jsxs("select", { className: "form-select form-select-sm topnav__category", value: categoryFilter === "all" ? "" : categoryFilter, onChange: (e) => onCategoryChange(e.target.value), "aria-label": "Category filter", children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((c) => (_jsx("option", { value: c, children: c }, c)))] }), _jsx("div", { className: "topnav__searchFlex", children: !searchOpen ? (_jsxs("button", { type: "button", className: "btn btn-outline-secondary btn-sm topnav__searchBtn w-100", onClick: toggleSearch, "aria-label": "Open search", title: "Search", children: [_jsx("i", { className: "fa-solid fa-magnifying-glass me-1" }), _jsx("span", { className: "d-none d-md-inline", children: "Search" })] })) : (_jsxs("div", { className: "input-group input-group-sm topnav__searchGroup", children: [_jsx("span", { className: "input-group-text", children: _jsx("i", { className: "fa-solid fa-magnifying-glass" }) }), _jsx("input", { ref: inputRef, className: "form-control", placeholder: "Search title\u2026", value: q, onChange: (e) => onQueryChange(e.target.value), onKeyDown: onSearchKeyDown, "aria-label": "Search stories by title" }), q && (_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: () => onQueryChange(""), "aria-label": "Clear search", children: "Clear" })), _jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: toggleSearch, "aria-label": "Close search", title: "Close (Esc)", children: "\u00D7" })] })) }), _jsx("div", { className: "topnav__scroller btn-group", role: "group", "aria-label": "Source filter", children: sourceOptions.map((s) => {
                                const active = sourceFilter === s;
                                return (_jsx("button", { type: "button", className: `btn btn-sm ${active ? "btn-primary" : "btn-outline-primary"}`, onClick: () => onSourceChange(s), children: s.toUpperCase() }, s));
                            }) }), isLoading && (_jsx("div", { className: "spinner-border spinner-border-sm text-secondary ms-2", role: "status", "aria-label": "Loading\u2026" }))] })] }) }));
}
