import { useEffect, useState } from "react";

const KEY = "bookmarks:v1";
const bus = new EventTarget();

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function save(next: Set<string>) {
  localStorage.setItem(KEY, JSON.stringify([...next]));
  bus.dispatchEvent(new Event("bookmarks-changed"));
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => load());

  useEffect(() => {
    const onChange = () => setBookmarks(load());
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) onChange(); };
    bus.addEventListener("bookmarks-changed", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      bus.removeEventListener("bookmarks-changed", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const isBookmarked = (id: string) => bookmarks.has(id);
  const toggle = (id: string) => {
    const next = new Set(bookmarks);
    next.has(id) ? next.delete(id) : next.add(id);
    save(next);
  };

  return { bookmarks, isBookmarked, toggle };
}
