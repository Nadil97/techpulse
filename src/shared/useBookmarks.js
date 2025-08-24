// import { useEffect, useState } from "react";
// const KEY = "bookmarks:v1";
// const bus = new EventTarget();
// function load(): Set<string> {
//   try {
//     const raw = localStorage.getItem(KEY);
//     return new Set(raw ? (JSON.parse(raw) as string[]) : []);
//   } catch {
//     return new Set();
//   }
// }
// function save(next: Set<string>) {
//   localStorage.setItem(KEY, JSON.stringify([...next]));
//   bus.dispatchEvent(new Event("bookmarks-changed"));
// }
// export function useBookmarks() {
//   const [bookmarks, setBookmarks] = useState<Set<string>>(() => load());
//   useEffect(() => {
//     const onChange = () => setBookmarks(load());
//     const onStorage = (e: StorageEvent) => { if (e.key === KEY) onChange(); };
//     bus.addEventListener("bookmarks-changed", onChange);
//     window.addEventListener("storage", onStorage);
//     return () => {
//       bus.removeEventListener("bookmarks-changed", onChange);
//       window.removeEventListener("storage", onStorage);
//     };
//   }, []);
//   const isBookmarked = (id: string) => bookmarks.has(id);
//   const toggle = (id: string) => {
//     const next = new Set(bookmarks);
//     next.has(id) ? next.delete(id) : next.add(id);
//     save(next);
//   };
//   return { bookmarks, isBookmarked, toggle };
// }
import { useEffect, useState } from "react";
const KEY = "bookmarks:v1";
const bus = new EventTarget();
function load() {
    try {
        const raw = localStorage.getItem(KEY);
        return new Set(raw ? JSON.parse(raw) : []);
    }
    catch {
        return new Set();
    }
}
function save(next) {
    localStorage.setItem(KEY, JSON.stringify([...next]));
    bus.dispatchEvent(new Event("bookmarks-changed"));
}
export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState(() => load());
    useEffect(() => {
        const onChange = () => setBookmarks(load());
        const onStorage = (e) => { if (e.key === KEY)
            onChange(); };
        bus.addEventListener("bookmarks-changed", onChange);
        window.addEventListener("storage", onStorage);
        return () => {
            bus.removeEventListener("bookmarks-changed", onChange);
            window.removeEventListener("storage", onStorage);
        };
    }, []);
    const isBookmarked = (id) => bookmarks.has(id);
    const add = (id) => {
        if (bookmarks.has(id))
            return;
        const next = new Set(bookmarks);
        next.add(id);
        save(next);
    };
    const remove = (id) => {
        if (!bookmarks.has(id))
            return;
        const next = new Set(bookmarks);
        next.delete(id);
        save(next);
    };
    const removeMany = (ids) => {
        const next = new Set(bookmarks);
        ids.forEach(id => next.delete(id));
        save(next);
    };
    const toggle = (id) => {
        const next = new Set(bookmarks);
        next.has(id) ? next.delete(id) : next.add(id);
        save(next);
    };
    return { bookmarks, isBookmarked, add, remove, removeMany, toggle };
}
