import type { NewsItem } from "../shared/types";

// Compact “rules of the road” for the assistant
export function systemPrompt() {
  return [
    "You are MechSIT News Assistant.",
    "Goals:",
    "1) Summarize articles clearly with Key Points.",
    "2) Answer questions about a specific story grounded in supplied context.",
    "3) Provide short, accurate background on tech topics.",
    "4) Compare related stories succinctly (what’s the same/different, why it matters).",
    "Style: concise, neutral, avoid hype, cite facts to the provided context; if context is thin, say so briefly.",
  ].join("\n");
}

// Build a compact context block from one story + optional related
export function buildStoryContext(item: NewsItem, related: NewsItem[] = []) {
  const head = `Story:
- Title: ${item.title}
- Source: ${item.source}
- URL: ${item.url ?? ""}
- Categories: ${item.categories?.join(", ") || "—"}
- Published: ${item.publishedAt ? new Date(item.publishedAt).toLocaleString() : "—"}
`;

  const rel = related.length
    ? "\nRelated headlines:\n" +
      related.slice(0, 5).map((r, i) => `- (${i + 1}) ${r.title} — ${r.source}`).join("\n")
    : "";

  return head + rel;
}

export function buildCompareContext(items: NewsItem[]) {
  return [
    "Compare these stories:",
    ...items.slice(0, 4).map((it, i) =>
      `(${i + 1}) ${it.title} — ${it.source} — ${it.url ?? ""}`
    ),
  ].join("\n");
}

export function summarizeInstruction(url?: string) {
  return [
    url ? `Summarize the article at: ${url}` : "Summarize the article.",
    "Format:",
    "• One-sentence overview",
    "• Key Points (3–6 bullets)",
    "• Why it matters (1–2 bullets)",
  ].join("\n");
}

export function qaInstruction(question: string) {
  return `Answer this question about the story. If the answer isn't in context, say what’s missing, then answer best-effort:\nQ: ${question}`;
}

export function contextInstruction(topic: string) {
  return [
    `Give concise background on: ${topic}`,
    "Explain: what it is, why it matters now, and common pitfalls/misconceptions (short).",
  ].join("\n");
}

export function compareInstruction() {
  return [
    "Compare the supplied stories.",
    "Cover: overlap, key differences (tech/strategy/timing), and likely implications.",
  ].join("\n");
}
