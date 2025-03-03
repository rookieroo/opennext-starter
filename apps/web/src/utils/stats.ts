import "server-only";
import { getDB } from "@/db";
import { userTable } from "@/db/schema";
import { withKVCache } from "./with-kv-cache";
import { getEnvByKey } from "@/lib/constants";

export async function getTotalUsers() {
  return withKVCache(
    async () => {
      const db = await getDB();

      return await db.$count(userTable);
    },
    {
      key: "stats:total-users",
      ttl: "1 hour",
    }
  );
}

export async function getGithubStars() {
  const GITHUB_REPO_URL = await getEnvByKey("GITHUB_REPO_URL");
  if (!GITHUB_REPO_URL || typeof GITHUB_REPO_URL !== "string") {
    return null;
  }

  // Extract owner and repo from GitHub URL
  const match = GITHUB_REPO_URL.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  const [, owner, repo] = match;

  if (!owner || !repo) return null;

  return withKVCache(
    async () => {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      if (!response.ok) return null;

      const data = (await response.json()) as {
        stargazers_count: number;
      };

      return data.stargazers_count;
    },
    {
      key: "stats:github-stars",
      ttl: "1 hour",
    }
  );
}

