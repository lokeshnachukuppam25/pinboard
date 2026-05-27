import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { PostModel } from "../models/Post.js";
import { UserModel } from "../models/User.js";
import { env } from "../env.js";
import { requireAuth, type AuthedRequest } from "../middleware/requireAuth.js";

export const postsRouter = Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.resolve("uploads")),
    filename: (_req, file, cb) => {
      const id = crypto.randomBytes(12).toString("hex");
      const ext = path.extname(file.originalname || "").slice(0, 12) || ".jpg";
      cb(null, `${id}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 }
});

postsRouter.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
  const q = String(req.query.q ?? "").trim();
  const tag = String(req.query.tag ?? "").trim();

  const filter: Record<string, unknown> = {};
  if (tag) filter.tags = tag;
  if (q) filter.$text = { $search: q };

  const posts = await PostModel.find(filter)
    .sort(q ? { score: { $meta: "textScore" } as any, createdAt: -1 } : { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const userIds = [...new Set(posts.map((p) => String(p.userId)))];
  const users = await UserModel.find({ _id: { $in: userIds } }).lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));

  return res.json({
    items: posts.map((p) => ({
      id: String(p._id),
      user: (() => {
        const u = byId.get(String(p.userId));
        return u
          ? { id: String(u._id), username: u.username, name: u.name, avatarUrl: u.avatarUrl }
          : { id: String(p.userId), username: "unknown", name: "Unknown", avatarUrl: "" };
      })(),
      title: p.title,
      description: p.description,
      imageUrl: p.imageUrl,
      tags: p.tags,
      likesCount: p.likes?.length ?? 0,
      savesCount: p.saves?.length ?? 0,
      commentsCount: p.comments?.length ?? 0,
      createdAt: p.createdAt
    })),
    page,
    limit,
    hasMore: posts.length === limit
  });
});

postsRouter.get("/:id", async (req, res) => {
  const post = await PostModel.findById(req.params.id).lean();
  if (!post) return res.status(404).json({ error: "NOT_FOUND" });

  const owner = await UserModel.findById(post.userId).lean();

  return res.json({
    post: {
      id: String(post._id),
      user: owner
        ? { id: String(owner._id), username: owner.username, name: owner.name, avatarUrl: owner.avatarUrl }
        : { id: String(post.userId), username: "unknown", name: "Unknown", avatarUrl: "" },
      title: post.title,
      description: post.description,
      imageUrl: post.imageUrl,
      tags: post.tags,
      likesCount: post.likes?.length ?? 0,
      savesCount: post.saves?.length ?? 0,
      createdAt: post.createdAt,
      comments: (post.comments ?? []).map((c) => ({
        id: String(c._id),
        userId: String(c.userId),
        text: c.text,
        createdAt: c.createdAt
      }))
    }
  });
});

postsRouter.post("/", requireAuth, upload.single("image"), async (req: AuthedRequest, res) => {
  const Body = z.object({
    title: z.string().min(1).max(120),
    description: z.string().max(1000).optional(),
    tags: z.string().optional()
  });

  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });
  if (!req.file) return res.status(400).json({ error: "MISSING_IMAGE" });

  const { title, description, tags } = parsed.data;
  const tagList =
    tags?.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12) ?? [];

  const imageUrl = `${env.PUBLIC_BASE_URL}/uploads/${req.file.filename}`;

  const post = await PostModel.create({
    userId: req.userId,
    title,
    description: description ?? "",
    tags: tagList,
    imageUrl
  });

  return res.status(201).json({ id: String(post._id) });
});

postsRouter.post("/:id/like", requireAuth, async (req: AuthedRequest, res) => {
  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "NOT_FOUND" });

  const uid = String(req.userId);
  const set = new Set((post.likes ?? []).map(String));
  if (set.has(uid)) set.delete(uid);
  else set.add(uid);
  post.likes = [...set] as any;
  await post.save();

  return res.json({ likesCount: post.likes.length, liked: set.has(uid) });
});

postsRouter.post("/:id/save", requireAuth, async (req: AuthedRequest, res) => {
  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "NOT_FOUND" });

  const uid = String(req.userId);
  const set = new Set((post.saves ?? []).map(String));
  if (set.has(uid)) set.delete(uid);
  else set.add(uid);
  post.saves = [...set] as any;
  await post.save();

  return res.json({ savesCount: post.saves.length, saved: set.has(uid) });
});

postsRouter.post("/:id/comments", requireAuth, async (req: AuthedRequest, res) => {
  const Body = z.object({ text: z.string().min(1).max(500) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "INVALID_BODY", details: parsed.error.flatten() });

  const post = await PostModel.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "NOT_FOUND" });

  post.comments.push({ userId: req.userId as any, text: parsed.data.text } as any);
  await post.save();

  return res.status(201).json({ commentsCount: post.comments.length });
});

