import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import Entry from "../models/Entry.js";
import ChatMessage from "../models/ChatMessage.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.use(requireAuth);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GET chat history
router.get("/messages", async (req, res) => {
  const messages = await ChatMessage.find({ user: req.userId }).sort({ createdAt: 1 }).limit(100);
  res.json({ messages });
});

// POST a message -> real Claude API call, grounded in the user's own stored data
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) {
    return res.status(400).json({ error: "message is required." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY is not set on the server. Add it in your Render environment variables.",
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `You are the personal AI agent inside LifeOS AI for ${user.displayName}. ` +
        `You help across four modules: Dashboard, Career Engine, Life OS, and Cloud Center. ` +
        `Here is this user's current saved data, use it to give specific, grounded advice instead of generic answers:\n${contextSummary}`,
      messages: [
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
    });

    const reply = response.content.find((b) => b.type === "text")?.text || "";

    await ChatMessage.create({ user: req.userId, role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("[ai] Claude API error:", err.message);
    res.status(502).json({ error: "The AI request failed. Check your ANTHROPIC_API_KEY and try again." });
  }
});

export default router;
