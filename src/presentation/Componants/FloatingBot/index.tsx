import { useEffect, useRef, useState } from "react";
import "./index.css";
import { chatDirect, type Msg, type Role } from "../../../lib/chatDirect";

type Message = { id: string; role: "bot" | "user"; text: string };

type Props = {
  position?: "br" | "bl";          
  title?: string;                  
  accent?: string;                
  defaultOpen?: boolean;
  welcome?: string;                
  placeholder?: string;            
  suggestions?: string[];          
  onOpenChange?: (open: boolean) => void;

  onSend?: (text: string, addBot: (text: string) => void) => void;
};

export default function FloatingBot({
  position = "br",
  title = "Chat with us",
  accent,
  defaultOpen = false,
  welcome = "Hi! How can I help you today?",
  placeholder = "Type a message…",
  suggestions = ["Pricing", "Get a quote", "Talk to support"],
  onOpenChange,
  onSend,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<Message[]>(() =>
    welcome ? [{ id: "m0", role: "bot", text: welcome }] : []
  );
  const [text, setText] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(1);

  // Esc closes panel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  // autoscroll on new messages
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const addBot = (t: string) => {
    setMessages((m) => [...m, { id: `m${idRef.current++}`, role: "bot", text: t }]);
  };

  // const send = (value?: string) => {
  //   const v = (value ?? text).trim();
  //   if (!v) return;
  //   setMessages((m) => [...m, { id: `m${idRef.current++}`, role: "user", text: v }]);
  //   setText("");

  //   if (onSend) {
  //     onSend(v, addBot);
  //   } else {
  //     // tiny mock reply so UI feels alive
  //     setTimeout(() => addBot("Thanks! A teammate will reply shortly."), 450);
  //   }
  // };

const send = async (value?: string) => {
  const v = (value ?? text).trim();
  if (!v) return;

  setMessages((m) => [...m, { id: `m${idRef.current++}`, role: "user", text: v }]);
  setText("");

  try {
    // turn your UI messages into API messages (typed!)
    const history: Msg[] = messages.slice(-8).map((m): Msg => ({
      role: (m.role === "bot" ? "assistant" : "user") as Role,
      content: m.text,
    }));

    const system: Msg = {
      role: "system",
      content:
        "You are Trend News Assistant. Be concise, friendly, and practical. If asked about pricing or contacting the team, give short next steps.",
    };

    const reply = await chatDirect([
      system,
      ...history,
      { role: "user", content: v } as Msg, // narrow the literal
    ]);

    setMessages((m) => [
      ...m,
      { id: `m${idRef.current++}`, role: "bot", text: reply || "No reply." },
    ]);
  } catch (e: any) {
    setMessages((m) => [
      ...m,
      {
        id: `m${idRef.current++}`,
        role: "bot",
        text:
          e?.message ||
          "Sorry—couldn’t reach the chat service. Please try again in a moment.",
      },
    ]);
  }
};
  const icon = open ? "fa-solid fa-xmark" : "fa-solid fa-robot";

  return (
    <div
      className={`fb ${position} ${open ? "open" : ""}`}
      style={accent ? ({ ["--fb-accent" as any]: accent } as React.CSSProperties) : undefined}
    >
      {/* Panel */}
      <section
        className="fb-panel card shadow-lg"
        role="dialog"
        aria-modal="false"
        aria-label="Chatbot"
      >
        <header className="fb-head">
          <div className="fb-title">
            <span className="fb-avatar"><i className="fa-solid fa-robot" /></span>
            <strong>{title}</strong>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary fb-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </header>

        <div className="fb-body" ref={bodyRef}>
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role}`}>
              <div className="bubble">{m.text}</div>
            </div>
          ))}

          {!!suggestions.length && (
            <div className="fb-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={`s${i}`}
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className="fb-input"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Type your message"
          />
          <button type="submit" className="btn btn-primary fb-send" aria-label="Send">
            <i className="fa-solid fa-paper-plane" />
          </button>
        </form>
      </section>

      {/* Floating button */}
      <button
        type="button"
        className="fb-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <span className="fb-icon"><i className={icon} /></span>
        <span className="fb-label">{open ? "Close" : "Chat"}</span>
      </button>
    </div>
  );
}
