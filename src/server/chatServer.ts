
import dotenv from "dotenv";
import { z } from "zod";
import OpenAI from "openai";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8788);

// Helper: choose provider
type Provider = "openai" | "openrouter" | "huggingface" | "mock";
function pickProvider(): Provider {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.HF_API_KEY) return "huggingface";
  return "mock";
}

// Request schema
const ChatBody = z.object({
  // prior messages to preserve context (optional)
  history: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
  // the newest user input
  prompt: z.string().min(1),
});

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt, history = [] } = ChatBody.parse(req.body);
    const provider = pickProvider();

    // Always add a compact system prompt to keep replies helpful + safe
    const systemPrompt =
      "You are Trend News Assistant. Be concise, friendly, and practical. If asked about pricing or contacting the team, provide short next-step instructions.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-12), // cap history
      { role: "user", content: prompt },
    ] as { role: "system" | "user" | "assistant"; content: string }[];

    let reply = "";

    if (provider === "openai") {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const out = await client.chat.completions.create({
        model,
        temperature: 0.7,
        messages,
      });
      reply = out.choices?.[0]?.message?.content?.trim() || "";
    } else if (provider === "openrouter") {
      const model =
        process.env.OPENROUTER_MODEL ||
        "meta-llama/llama-3.1-8b-instruct:free";

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          // optional but recommended by OpenRouter:
          "HTTP-Referer": "http://localhost", // or your site
          "X-Title": "Trend News Assistant",
        },
        body: JSON.stringify({ model, messages, temperature: 0.7 }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`OpenRouter error: ${resp.status} ${errText}`);
      }
      const data = await resp.json();
      reply = data?.choices?.[0]?.message?.content?.trim() || "";
    } else if (provider === "huggingface") {
      // Simple instruct prompt for HF text-generation models
      const model =
        process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.2";
      const promptText = toHFPrompt(messages);

      const resp = await fetch(
        `https://api-inference.huggingface.co/models/${encodeURIComponent(
          model
        )}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: promptText,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`HF error: ${resp.status} ${errText}`);
      }

      const data = await resp.json();
      // HF returns array or object depending on model; handle both
      if (Array.isArray(data)) {
        reply = data[0]?.generated_text?.trim() ?? "";
      } else if (typeof data === "object" && data?.generated_text) {
        reply = String(data.generated_text).trim();
      } else if (data?.[0]?.generated_text) {
        reply = String(data[0].generated_text).trim();
      }
    } else {
      // Last-resort mock to keep UI alive if no keys set
      reply =
        "Thanks! A teammate will reply shortly. (Tip: add an API key to .env to enable real AI answers.)";
    }

    res.json({ reply });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      error: true,
      message:
        err?.message ||
        "Failed to process your request. Please try again in a moment.",
    });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true, provider: pickProvider() }));

app.listen(PORT, () => {
  console.log(`Chat server listening on http://localhost:${PORT}`);
});

/* ------- helpers ------- */

// Turn chat messages into a simple Instruct prompt for HF models
function toHFPrompt(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) {
  // Use Mistral/Llama instruction template: <s>[INST] ... [/INST] assistant ...
  let out = "";
  for (const m of messages) {
    if (m.role === "system") {
      out += `<s>[INST] ${m.content} [/INST]\n`;
    } else if (m.role === "user") {
      out += `<s>[INST] ${m.content} [/INST]\n`;
    } else {
      out += `${m.content}\n`;
    }
  }
  return out.trim();
}
