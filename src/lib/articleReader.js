// Fetch readable article text via Jina AI Reader (free, CORS-friendly).
// Example: https://r.jina.ai/http://example.com/...
export async function fetchArticleText(url) {
    try {
        const normalized = url.trim();
        if (!/^https?:\/\//i.test(normalized))
            return "";
        const readerUrl = "https://r.jina.ai/http://" + normalized.replace(/^https?:\/\//i, "");
        const resp = await fetch(readerUrl);
        if (!resp.ok)
            throw new Error(`Reader ${resp.status}`);
        const text = await resp.text();
        // Some sites return huge content; trim for model input safety
        return text?.slice(0, 60000) ?? ""; // ~60k chars (safe for small models)
    }
    catch {
        return "";
    }
}
