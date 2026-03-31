import { NextResponse } from "next/server";

interface Tweet {
  id: string;
  text: string;
  created_at?: string;
}

interface CachedData {
  tweets: Tweet[];
  fetchedAt: number;
}

let cache: CachedData | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getUserId(
  username: string,
  bearerToken: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.x.com/2/users/by/username/${username}`,
    { headers: { Authorization: `Bearer ${bearerToken}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.id ?? null;
}

async function fetchTweets(
  userId: string,
  bearerToken: string
): Promise<Tweet[]> {
  const res = await fetch(
    `https://api.x.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at`,
    { headers: { Authorization: `Bearer ${bearerToken}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.data ?? [];
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ tweets: cache.tweets });
  }

  const bearerToken = process.env.X_BEARER_TOKEN;
  const username = process.env.X_USERNAME;

  if (!bearerToken || !username) {
    return NextResponse.json({ tweets: [], error: "Missing credentials" }, { status: 500 });
  }

  const userId = await getUserId(username, bearerToken);
  if (!userId) {
    return NextResponse.json({ tweets: [], error: "User not found" }, { status: 404 });
  }

  const tweets = await fetchTweets(userId, bearerToken);

  cache = { tweets, fetchedAt: Date.now() };

  return NextResponse.json({ tweets });
}
