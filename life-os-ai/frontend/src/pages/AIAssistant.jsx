import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.getMessages().then((res) => setMessages(res.messages));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setSending(true);

    try {
      const res = await api.sendMessage(text);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="main">
      <p className="page-eyebrow">Module 05</p>
      <h1 className="page-title">AI Assistant</h1>

      <div className="chat-window">
        <div className="chat-messages" ref={scrollRef}>
          {messages.length === 0 && (
            <p style={{ color: "var(--text-dim)" }}>
              Ask me anything about your career goals, tasks, or cloud items — I read your saved data before answering.
            </p>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role}`}>{m.content}</div>
          ))}
          {sending && <div className="chat-bubble assistant">Thinking…</div>}
        </div>
        <form className="chat-input-row" onSubmit={send}>
          <input
            type="text"
            placeholder="Ask your agent..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={sending}>Send</button>
        </form>
      </div>
    </div>
  );
}
