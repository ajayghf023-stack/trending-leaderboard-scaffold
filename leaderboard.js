
import Redis from "ioredis";
import "dotenv/config";

export const redis = new Redis(process.env.REDIS_URL);

/**
 * Record one unit of engagement for a post.
 */
export async function upvote(postId) {
  const score = await redis.zincrby("trending:posts", 1, postId);
  return Number(score);
}

/**
 * Fetch the top N posts with their metadata.
 */
export async function getTop(n) {
  // Get posts ranked from highest to lowest score
  const data = await redis.zrevrange(
    "trending:posts",
    0,
    n - 1,
    "WITHSCORES"
  );

  const rows = [];

  for (let i = 0; i < data.length; i += 2) {
    rows.push({
      id: data[i],
      score: Number(data[i + 1]),
    });
  }

  // Fetch all metadata using one pipeline
  const pipeline = redis.pipeline();

  for (const row of rows) {
    pipeline.hgetall(`${row.id}:meta`);
  }

  const results = await pipeline.exec();

  // Combine each post with its metadata
  return rows.map((row, k) => ({
    ...row,
    ...(results[k][1] || {}),
  }));
}
