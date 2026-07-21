import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Entry from "../models/Entry.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.use(requireAuth);

// Google Gemini 1.5 Flash — FREE tier: 15 req/min, 1M tokens/day, no credit card needed
// Get your free key at: https://aistudio.google.com/app/apikey
const getGemini = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

// GET chat history
router.get("/messages", async (req, res) => {
  const messages = await ChatMessage.find({ user: req.userId }).sort({ createdAt: 1 }).limit(100);
  res.json({ messages });
});

// POST a message -> Gemini 1.5 Flash (FREE), grounded in the user's own stored data
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "GEMINI_API_KEY is not set. Add it free at https://aistudio.google.com/app/apikey then set it in your hosting environment variables.",
    });
  }

  const user = await User.findById(req.userId);
  const entries = await Entry.find({ user: req.userId }).sort({ createdAt: -1 }).limit(30);

  const contextSummary = entries.length
    ? entries.map((e) => `- [${e.module}] ${e.title} (${e.status})${e.details ? ": " + e.details : ""}`).join("\n")
    : "No saved entries yet.";

  const history = await ChatMessage.find({ user: req.userId }).sort({ createdAt: 1 }).limit(20);

  await ChatMessage.create({ user: req.userId, role: "user", content: message });

  try {
    const model = getGemini();

    // Build Gemini chat history (must alternate user/model, start with user)
    const geminiHistory = [];
    for (const m of history) {
      geminiHistory.push({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      });
    }

    // System instruction injected as first user turn if history is empty,
    // otherwise prepended to the system instruction field
    const systemInstruction =
      `You are the personal AI agent inside LifeOS AI for ${user.displayName || "the user"}. ` +
      `You help across four modules: Dashboard, Career Engine, Life OS, and Cloud Center. ` +
      `Here is this user's current saved data — use it to give specific, grounded advice instead of generic answers:\n${contextSummary}`;

    const geminiModel = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction,
    });

    const chat = geminiModel.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    await ChatMessage.create({ user: req.userId, role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("[ai] Gemini API error:", err.message);
    res.status(502).json({ error: "The AI request failed. Check your GEMINI_API_KEY and try again." });
  }
});

export default router;
