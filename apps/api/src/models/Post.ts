import mongoose, { type InferSchemaType, type Types } from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 500 }
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 1000 },
    imageUrl: { type: String, required: true },
    tags: { type: [String], default: [], index: true },
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    saves: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
    comments: { type: [CommentSchema], default: [] }
  },
  { timestamps: true }
);

PostSchema.index({ title: "text", description: "text", tags: "text" });

export type Post = InferSchemaType<typeof PostSchema> & {
  _id: Types.ObjectId;
};

export const PostModel =
  (mongoose.models.Post as mongoose.Model<Post>) ||
  mongoose.model<Post>("Post", PostSchema);

