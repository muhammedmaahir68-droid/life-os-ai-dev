import express from "express";
import Entry from "../models/Entry.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.use(requireAuth);

// Calls Google Gemini 1.5 Flash REST API directly — no SDK, no npm install needed.
// FREE: 15 req/min, 1 million tokens/day. Get key: https://aistudio.google.com/app/apikey
async function callGemini(apiKey, systemInstruction, history, userMessage) {
  const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  // Build contents array: history + new user message
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text in response");
  return text;
}

// GET chat history
router.get("/messages", async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to load messages." });
  }
});

// POST a message -> Gemini 1.5 Flash (FREE), grounded in user's own stored data
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "GEMINI_API_KEY is not set. Get it free at https://aistudio.google.com/app/apikey then add it to your Render environment variables.",
    });
  }

  try {
    const user = await User.findById(req.userId);
    const entries = await Entry.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const contextSummary = entries.length
      ? entries
          .map(
            (e) =>
              `- [${e.module}] ${e.title} (${e.status})${e.details ? ": " + e.details : ""}`
          )
          .join("\n")
      : "No saved entries yet.";

    const systemInstruction =
      `You are the personal AI agent inside LifeOS AI for ${user?.displayName || "the user"}. ` +
      `You help across four modules: Dashboard, Career Engine, Life OS, and Cloud Center. ` +
      `Here is this user's current saved data — use it to give specific, grounded advice:\n` +
      contextSummary;

    const history = await ChatMessage.find({ user: req.userId })
      .sort({ createdAt: 1 })
      .limit(20);

    // Save user message first
    await ChatMessage.create({ user: req.userId, role: "user", content: message });

    // Call Gemini via REST (no SDK)
    const reply = await callGemini(apiKey, systemInstruction, history, message);

    // Save assistant reply
    await ChatMessage.create({ user: req.userId, role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("[ai] Gemini error:", err.message);
    res.status(502).json({
      error: `AI request failed: ${err.message}`,
    });
  }
});

export default router;

