// A single-use, expiring token service backed by Redis.
import crypto from "node:crypto";
import Redis from "ioredis";
import "dotenv/config";

const redis = new Redis(process.env.REDIS_URL);
const keyFor = (id) => "token:" + id;

/**
 * Issue a single-use token that expires after ttlSeconds.
 * @param {object} payload JSON-serialisable token data.
 * @param {number} ttlSeconds Time to live in seconds.
 * @returns {Promise<string>} Token ID.
 */
export async function issueToken(payload, ttlSeconds) {
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
    throw new TypeError("ttlSeconds must be a positive integer");
  }
  const tokenId = crypto.randomBytes(16).toString("hex");
  const value = JSON.stringify(payload);
  const stored = await redis.set(keyFor(tokenId), value, "EX", ttlSeconds, "NX");
  if (stored !== "OK") {
    throw new Error("Unable to issue token");
  }
  return tokenId;
}

/**
 * Atomically consume a token at most once.
 * @param {string} tokenId
 * @returns {Promise<{ ok: true, payload: object } | { ok: false, reason: string }>}
 */
export async function consumeToken(tokenId) {
  const value = await redis.getdel(keyFor(tokenId));
  if (value === null) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, payload: JSON.parse(value) };
}

export function closeRedis() {
  return redis.quit();
}
