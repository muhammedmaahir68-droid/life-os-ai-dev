import express from "express";
import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

function issueToken(res, userId) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

// Kick off GitHub OAuth
router.get("/github", passport.authenticate("github", { session: false }));

// GitHub redirects here after the user approves
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=1` }),
  (req, res) => {
    issueToken(res, req.user._id);
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("-__v");
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
