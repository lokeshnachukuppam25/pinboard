import mongoose from "mongoose";
import { env } from "./src/env.js";
import { UserModel } from "./src/models/User.js";
import { PostModel } from "./src/models/Post.js";

// Better content with matching titles and descriptions
const postContent = [
  {
    title: "Beautiful Mountain Landscape",
    description: "Majestic peaks covered in snow with a golden sunset reflection over the valleys",
    tags: ["photography", "nature", "mountains"],
  },
  {
    title: "Urban Street Photography",
    description: "Bustling city streets captured with vibrant colors and dynamic street energy",
    tags: ["photography", "urban", "city"],
  },
  {
    title: "Nature Sunset Vibes",
    description: "Golden hour magic over rolling hills creating stunning color gradients",
    tags: ["nature", "sunset", "landscape"],
  },
  {
    title: "Modern Architecture Design",
    description: "Contemporary buildings showcasing innovative geometric designs and clean lines",
    tags: ["architecture", "urban", "design"],
  },
  {
    title: "Coastal Beach Serenity",
    description: "Peaceful sandy shores with crystal clear turquoise waters and gentle waves",
    tags: ["beach", "travel", "nature"],
  },
  {
    title: "Forest Path Adventure",
    description: "Dense green forest trails perfect for hiking through untouched wilderness",
    tags: ["hiking", "forest", "adventure"],
  },
  {
    title: "City Lights at Night",
    description: "Stunning urban skyline illuminated with colorful city lights after dark",
    tags: ["city", "urban", "photography"],
  },
  {
    title: "Desert Dunes Explorer",
    description: "Vast golden sand dunes stretching infinitely across the horizon at sunrise",
    tags: ["desert", "travel", "landscape"],
  },
  {
    title: "Waterfall Paradise",
    description: "Cascading waterfalls surrounded by lush tropical vegetation and rainforest",
    tags: ["nature", "outdoor", "travel"],
  },
  {
    title: "Mountain Peak View",
    description: "Breathtaking panoramic views from the summit of towering alpine mountains",
    tags: ["mountains", "hiking", "adventure"],
  },
  {
    title: "Ocean Waves Surfing",
    description: "Perfect waves crashing on the beach ideal for an epic surfing adventure",
    tags: ["beach", "adventure", "outdoor"],
  },
  {
    title: "Autumn Leaves Beauty",
    description: "Golden and crimson foliage creating stunning landscapes in fall season",
    tags: ["nature", "landscape", "photography"],
  },
  {
    title: "Snow Covered Mountains",
    description: "Alpine peaks blanketed in pristine white snow under clear blue skies",
    tags: ["mountains", "winter", "landscape"],
  },
  {
    title: "Tropical Island Getaway",
    description: "Paradise islands with palm trees and turquoise lagoons perfect for vacation",
    tags: ["travel", "beach", "tropical"],
  },
  {
    title: "Canyon Hiking Trail",
    description: "Dramatic canyon walls and scenic hiking paths through breathtaking terrain",
    tags: ["hiking", "nature", "adventure"],
  },
];

function getPlaceholderImage(index: number): string {
  // Using picsum.photos which is more reliable
  return `https://picsum.photos/900/900?random=${index}`;
}

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete all existing data
    await PostModel.deleteMany({});
    await UserModel.deleteMany({});
    console.log("Cleared old data");

    // Create fresh test users
    const users = await UserModel.create([
      {
        email: "photographer@example.com",
        username: "photographer",
        name: "Alex Photographer",
        passwordHash: "hashed_password_1",
        bio: "Professional nature and travel photographer",
        avatarUrl: "https://i.pravatar.cc/150?img=10",
      },
      {
        email: "explorer@example.com",
        username: "explorer",
        name: "Jordan Explorer",
        passwordHash: "hashed_password_2",
        bio: "Adventure seeker exploring the world one step at a time",
        avatarUrl: "https://i.pravatar.cc/150?img=20",
      },
      {
        email: "creator@example.com",
        username: "creator",
        name: "Sam Creator",
        passwordHash: "hashed_password_3",
        bio: "Creative content creator and visual artist",
        avatarUrl: "https://i.pravatar.cc/150?img=30",
      },
    ]);
    console.log(`Created ${users.length} users`);

    // Create 50 posts with matching content
    console.log("Creating 50 posts with proper content...");
    const postsToCreate = [];

    for (let i = 0; i < 50; i++) {
      const content = postContent[i % postContent.length];
      const user = users[i % users.length];

      postsToCreate.push({
        userId: user._id,
        title: `${content.title} #${i + 1}`,
        description: content.description,
        imageUrl: getPlaceholderImage(i),
        tags: content.tags,
        likes: [],
        saves: [],
        comments: [],
      });
    }

    await PostModel.insertMany(postsToCreate);
    console.log("✓ Successfully created 50 posts!");

    // Show summary
    const totalPosts = await PostModel.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    console.log(`\nDatabase Summary:`);
    console.log(`- Total users: ${totalUsers}`);
    console.log(`- Total posts: ${totalPosts}`);

    await mongoose.connection.close();
    console.log("✓ Database seeding complete!");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
