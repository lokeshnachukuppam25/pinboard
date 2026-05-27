import { Router } from "express";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { PostModel } from "../models/Post.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await UserModel.findById(req.userId).lean();
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json({
    user: {
      id: String(user._id),
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }
  });
});

usersRouter.patch("/me", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({
    name: z.string().min(1).max(50).optional(),
    bio: z.string().max(240).optional(),
    avatarUrl: z.string().max(500).optional()
  });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });

  const user = await UserModel.findByIdAndUpdate(req.userId, parsed.data, { new: true }).lean();
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json({
    user: {
      id: String(user._id),
      email: user.email,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }
  });
});

usersRouter.get("/:username", async (req, res) => {
  const user = await UserModel.findOne({ username: req.params.username }).lean();
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });

  return res.json({
    user: {
      id: String(user._id),
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio
    }
  });
});

usersRouter.get("/:username/posts", async (req, res) => {
  const user = await UserModel.findOne({ username: req.params.username }).lean();
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });

  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));

  const posts = await PostModel.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return res.json({
    items: posts.map((p) => ({
      id: String(p._id),
      userId: String(p.userId),
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      tags: p.tags,
      likesCount: p.likes?.length ?? 0,
      savesCount: p.saves?.length ?? 0,
      createdAt: p.createdAt
    })),
    page,
    limit,
    hasMore: posts.length === limit
  });
});

usersRouter.get("/:username/saved", requireAuth, async (req: AuthedRequest, res) => {
  const user = await UserModel.findOne({ username: req.params.username }).lean();
  if (!user) return res.status(404).json({ error: "NOT_FOUND" });

  if (String(user._id) !== String(req.userId)) return res.status(403).json({ error: "FORBIDDEN" });

  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));

  const posts = await PostModel.find({ saves: user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return res.json({
    items: posts.map((p) => ({
      id: String(p._id),
      userId: String(p.userId),
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      tags: p.tags,
      likesCount: p.likes?.length ?? 0,
      savesCount: p.saves?.length ?? 0,
      createdAt: p.createdAt
    })),
    page,
    limit,
    hasMore: posts.length === limit
  });
});

