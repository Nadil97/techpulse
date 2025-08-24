const canonical = (u) => u.replace(/(\?|#).*$/, '');
export function normalizeAndSort(items) {
    // De-dupe by canonical URL
    const uniq = {};
    for (const it of items) {
        const key = canonical(it.url || it.id);
        if (!uniq[key])
            uniq[key] = it;
    }
    const arr = Object.values(uniq);
    // Sort: prefer HN points, then date desc
    return arr.sort((a, b) => {
        const ap = a.points ?? 0;
        const bp = b.points ?? 0;
        if (ap !== bp)
            return bp - ap;
        const ad = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const bd = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return bd - ad;
    });
}
