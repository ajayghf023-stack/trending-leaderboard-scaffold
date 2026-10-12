
import { redis } from "./leaderboard.js";

async function seed() {
  await redis.del("trending:posts");

  // Create one pipeline for all writes
  const pipeline = redis.pipeline();

  for (let i = 1; i <= 100; i++) {
    const postKey = `post:${i}:meta`;
    const postId = `post:${i}`;
    const score = Math.floor(Math.random() * 50);

    // Store post metadata
    pipeline.hset(postKey, {
      title: `Post number ${i}`,
      author: `@user${i}`,
    });

    // Add post to the trending sorted set
    pipeline.zadd("trending:posts", score, postId);
  }

  // Execute all 200 commands in one pipeline
  await pipeline.exec();

  console.log("Seeded 100 posts.");

  redis.disconnect();
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  redis.disconnect();
  process.exitCode = 1;
});
