import mongoose from "mongoose";
import { env } from "./src/env.js";
import { PostModel } from "./src/models/Post.js";

async function debug() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    const posts = await PostModel.find().limit(10).lean();
    console.log("Sample posts:");
    posts.forEach((p, i) => {
      console.log(`\nPost ${i + 1}:`);
      console.log(`  ID: ${p._id}`);
      console.log(`  Title: ${p.title}`);
      console.log(`  Description: ${p.description}`);
      console.log(`  ImageUrl: ${p.imageUrl}`);
      console.log(`  Tags: ${p.tags}`);
    });
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

debug();
