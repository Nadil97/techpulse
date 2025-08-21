import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import "./index.css";
import { chatDirect } from "../../../lib/chatDirect";
export default function FloatingBot({ position = "br", title = "Chat with us", accent, defaultOpen = false, welcome = "Hi! How can I help you today?", placeholder = "Type a message…", suggestions = ["Pricing", "Get a quote", "Talk to support"], onOpenChange, onSend, }) {
    const [open, setOpen] = useState(defaultOpen);
    const [messages, setMessages] = useState(() => welcome ? [{ id: "m0", role: "bot", text: welcome }] : []);
    const [text, setText] = useState("");
    const bodyRef = useRef(null);
    const idRef = useRef(1);
    // Esc closes panel
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
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
    const addBot = (t) => {
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
    const send = async (value) => {
        const v = (value ?? text).trim();
        if (!v)
            return;
        setMessages((m) => [...m, { id: `m${idRef.current++}`, role: "user", text: v }]);
        setText("");
        try {
            // turn your UI messages into API messages (typed!)
            const history = messages.slice(-8).map((m) => ({
                role: (m.role === "bot" ? "assistant" : "user"),
                content: m.text,
            }));
            const system = {
                role: "system",
                content: "You are Trend News Assistant. Be concise, friendly, and practical. If asked about pricing or contacting the team, give short next steps.",
            };
            const reply = await chatDirect([
                system,
                ...history,
                { role: "user", content: v },
            ]);
            setMessages((m) => [
                ...m,
                { id: `m${idRef.current++}`, role: "bot", text: reply || "No reply." },
            ]);
        }
        catch (e) {
            setMessages((m) => [
                ...m,
                {
                    id: `m${idRef.current++}`,
                    role: "bot",
                    text: e?.message ||
                        "Sorry—couldn’t reach the chat service. Please try again in a moment.",
                },
            ]);
        }
    };
    const icon = open ? "fa-solid fa-xmark" : "fa-solid fa-robot";
    return (_jsxs("div", { className: `fb ${position} ${open ? "open" : ""}`, style: accent ? { ["--fb-accent"]: accent } : undefined, children: [_jsxs("section", { className: "fb-panel card shadow-lg", role: "dialog", "aria-modal": "false", "aria-label": "Chatbot", children: [_jsxs("header", { className: "fb-head", children: [_jsxs("div", { className: "fb-title", children: [_jsx("span", { className: "fb-avatar", children: _jsx("i", { className: "fa-solid fa-robot" }) }), _jsx("strong", { children: title })] }), _jsx("button", { className: "btn btn-sm btn-outline-secondary fb-close", onClick: () => setOpen(false), "aria-label": "Close chat", children: _jsx("i", { className: "fa-solid fa-xmark" }) })] }), _jsxs("div", { className: "fb-body", ref: bodyRef, children: [messages.map((m) => (_jsx("div", { className: `msg ${m.role}`, children: _jsx("div", { className: "bubble", children: m.text }) }, m.id))), !!suggestions.length && (_jsx("div", { className: "fb-suggestions", children: suggestions.map((s, i) => (_jsx("button", { className: "btn btn-sm btn-outline-secondary", onClick: () => send(s), children: s }, `s${i}`))) }))] }), _jsxs("form", { className: "fb-input", onSubmit: (e) => {
                            e.preventDefault();
                            send();
                        }, children: [_jsx("input", { type: "text", className: "form-control", placeholder: placeholder, value: text, onChange: (e) => setText(e.target.value), "aria-label": "Type your message" }), _jsx("button", { type: "submit", className: "btn btn-primary fb-send", "aria-label": "Send", children: _jsx("i", { className: "fa-solid fa-paper-plane" }) })] })] }), _jsxs("button", { type: "button", className: "fb-btn", onClick: () => setOpen((v) => !v), "aria-expanded": open, "aria-label": open ? "Close chat" : "Open chat", children: [_jsx("span", { className: "fb-icon", children: _jsx("i", { className: icon }) }), _jsx("span", { className: "fb-label", children: open ? "Close" : "Chat" })] })] }));
}
