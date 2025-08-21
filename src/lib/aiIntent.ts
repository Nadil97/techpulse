export type AiIntent =
  | { kind: "summarize"; url?: string }
  | { kind: "qa"; question: string }
  | { kind: "context"; topic: string }
  | { kind: "compare"; urls?: string[] }
  | { kind: "chitchat"; text: string };

const URL_RE = /(https?:\/\/[^\s]+)/i;

export function parseIntent(input: string): AiIntent {
  const text = input.trim();
  const urls = [...text.matchAll(URL_RE)].map(m => m[1]);
  const low = text.toLowerCase();

  if (low.startsWith("summarize") || low.startsWith("summary")) {
    return { kind: "summarize", url: urls[0] };
  }
  if (low.startsWith("compare")) {
    return { kind: "compare", urls };
  }
  if (low.startsWith("context ") || low.startsWith("background ")) {
    return { kind: "context", topic: text.replace(/^(\w+)\s+/,'') || text };
  }
  if (low.startsWith("qa ") || low.startsWith("question ")) {
    return { kind: "qa", question: text.replace(/^(\w+)\s+/,'') || text };
  }

  // Heuristic: contains a URL and says “what/why/how” => QA on article
  if (urls.length && /\b(what|why|how|when|who)\b/i.test(text)) {
    return { kind: "qa", question: text };
  }

  // Fallback = plain chat
  return { kind: "chitchat", text };
}
