
import { upvote, getTop, redis } from "./leaderboard.js";

async function run() {
  const target = "post:50";

  // Upvote the target 50 times
  for (let i = 0; i < 50; i++) {
    await upvote(target);
  }

  // Fetch the top 10 with metadata
  const top = await getTop(10);

  console.log("Top 10:");
  top.forEach((p, i) =>
    console.log(
      `  #${i + 1}  ${p.id}  score=${p.score}  ${p.title} (${p.author})`
    )
  );

  const madeIt = top.some((p) => p.id === target);

  console.log(
    madeIt
      ? `\nPASS ✅  ${target} reached the top 10`
      : `\nFAIL ❌  ${target} is NOT in the top 10`
  );

  redis.disconnect();
  process.exit(madeIt ? 0 : 1);
}

run().catch((error) => {
  console.error("Test failed:", error);
  redis.disconnect();
  process.exit(1);
});
