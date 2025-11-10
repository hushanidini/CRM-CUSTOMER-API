import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  ttl: number; // Time to live in seconds
  key?: (req: Request) => string;
}

const cache = new Map<string, { data: any; expires: number }>();

export const cacheMiddleware = (options: CacheOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = options.key
      ? options.key(req)
      : `${req.originalUrl || req.url}`;

    // Check if cached response exists and is valid
    const cached = cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function (data: any) {
      cache.set(cacheKey, {
        data,
        expires: Date.now() + options.ttl * 1000,
      });
      return originalJson(data);
    };

    next();
  };
};

// Clear cache helper
export const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};
