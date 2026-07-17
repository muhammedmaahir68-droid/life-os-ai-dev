import express from "express";
import Entry from "../models/Entry.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
router.use(requireAuth);

// GET /api/entries?module=career
router.get("/", async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.module) filter.module = req.query.module;

  const entries = await Entry.find(filter).sort({ createdAt: -1 });
  res.json({ entries });
});

router.post("/", async (req, res) => {
  const { module, title, details, status, dueDate } = req.body;

  if (!module || !title) {
    return res.status(400).json({ error: "module and title are required." });
  }

  const entry = await Entry.create({
    user: req.userId,
    module,
    title,
    details,
    status,
    dueDate,
  });

  res.status(201).json({ entry });
});

router.patch("/:id", async (req, res) => {
  const entry = await Entry.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body,
    { new: true }
  );

  if (!entry) return res.status(404).json({ error: "Entry not found." });
  res.json({ entry });
});

router.delete("/:id", async (req, res) => {
  const entry = await Entry.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!entry) return res.status(404).json({ error: "Entry not found." });
  res.json({ ok: true });
});

export default router;
