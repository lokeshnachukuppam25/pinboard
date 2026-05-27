import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { signAccessToken } from "../auth.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const Body = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
    name: z.string().min(1).max(50),
    password: z.string().min(8).max(72)
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });

  const { email, username, name, password } = parsed.data;

  const exists = await UserModel.findOne({ $or: [{ email }, { username }] }).lean();
  if (exists) return res.status(409).json({ error: "USER_EXISTS" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ email, username, name, passwordHash });

  const token = signAccessToken(String(user._id));
  return res.json({
    token,
    user: { id: String(user._id), email: user.email, username: user.username, name: user.name, avatarUrl: user.avatarUrl }
  });
});

authRouter.post("/login", async (req, res) => {
  const Body = z.object({
    emailOrUsername: z.string().min(1),
    password: z.string().min(1)
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });

  const { emailOrUsername, password } = parsed.data;

  const user = await UserModel.findOne({
    $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername }]
  });
  if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

  const token = signAccessToken(String(user._id));
  return res.json({
    token,
    user: { id: String(user._id), email: user.email, username: user.username, name: user.name, avatarUrl: user.avatarUrl }
  });
});

