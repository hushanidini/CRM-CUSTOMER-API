import rateLimit, { Options } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

// Create Redis client
const redisClient = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : null;

export const createRateLimiter = () => {
  const store = redisClient 
    ? new RedisStore({
        // @ts-ignore - sendCommand is the correct property for ioredis
        sendCommand: (...args: string[]) => redisClient.call(...args),
        prefix: "rl:",
      })
    : undefined;

  const limiterConfig: Partial<Options> = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later.",
    headers: true,
    skip: (req) => {
      const skipIPs = ["127.0.0.1", "::1"];
      return skipIPs.includes(req.ip || "");
    },
    store, // Add store to config
  };

  return rateLimit(limiterConfig);
};