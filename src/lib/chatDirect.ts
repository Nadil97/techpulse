export type Role = "system" | "user" | "assistant";
export type Msg = { role: Role; content: string };
type Provider = "openrouter" | "hf" | "openai";

const PROVIDER = (import.meta.env.VITE_PROVIDER || "openrouter") as Provider;

function cleanKey(v?: string) {
  return (v || "").replace(/^Bearer\s+/i, "").trim();
}

export async function chatDirect(messages: Msg[]): Promise<string> {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("No messages provided");
  }

  if (PROVIDER === "openrouter") {
    const raw = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
    const key = cleanKey(raw);
    const model =
      (import.meta.env.VITE_OPENROUTER_MODEL as string) ||
      "meta-llama/llama-3.1-8b-instruct:free";
    const siteUrl =
      (import.meta.env.VITE_SITE_URL as string) ||
      (typeof window !== "undefined" ? window.location.origin : "http://localhost");

    if (!key) throw new Error("Missing VITE_OPENROUTER_API_KEY");
    if (!key.startsWith("or_")) console.warn("OpenRouter key doesn’t look right.");

    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        // OpenRouter recommends these from browser:
        "HTTP-Referer": siteUrl,
        "X-Title": "Trend News Assistant",
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 }),
    });

    const txt = await resp.text();
    if (!resp.ok) {
      // Forward useful server message
      throw new Error(extractErr(txt) || `OpenRouter ${resp.status}`);
    }
    const data = JSON.parse(txt);
    return data?.choices?.[0]?.message?.content?.trim() || "No reply.";
  }

  if (PROVIDER === "hf") {
    const raw = import.meta.env.VITE_HF_API_KEY as string | undefined;
    const key = cleanKey(raw);
    const model =
      (import.meta.env.VITE_HF_MODEL as string) ||
      "mistralai/Mistral-7B-Instruct-v0.2";
    if (!key) throw new Error("Missing VITE_HF_API_KEY");

    const prompt = toHFPrompt(messages);
    const resp = await fetch(
      `https://api-inference.huggingface.co/models/${encodeURIComponent(model)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false },
        }),
      }
    );

    const txt = await resp.text();
    if (!resp.ok) {
      throw new Error(extractErr(txt) || `HF ${resp.status}`);
    }
    const data = JSON.parse(txt);
    if (Array.isArray(data)) return (data[0]?.generated_text || "").trim();
    return (data?.generated_text || data?.[0]?.generated_text || "No reply.").trim();
  }

  // OpenAI is usually blocked by CORS and exposes your key. Not advised in browser.
  const raw = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
  const key = cleanKey(raw);
  const model = (import.meta.env.VITE_OPENAI_MODEL as string) || "gpt-4o-mini";
  if (!key) throw new Error("Missing VITE_OPENAI_API_KEY");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature: 0.7 }),
  });
  const txt = await resp.text();
  if (!resp.ok) throw new Error(extractErr(txt) || `OpenAI ${resp.status}`);
  const data = JSON.parse(txt);
  return data?.choices?.[0]?.message?.content?.trim() || "No reply.";
}

function toHFPrompt(messages: Msg[]) {
  let out = "";
  for (const m of messages) {
    if (m.role === "system" || m.role === "user") out += `<s>[INST] ${m.content} [/INST]\n`;
    else out += `${m.content}\n`;
  }
  return out.trim();
}

function extractErr(txt: string) {
  try {
    const j = JSON.parse(txt);
    // OpenRouter style: { error: { message, code } }
    if (j?.error?.message) return j.error.message;
    if (j?.message) return j.message;
  } catch {}
  return "";
}
