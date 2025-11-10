import compression from 'compression';
import { Request, Response } from 'express';
// Response compression
export const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (0-9, where 6 is a good balance)
  level: 6,
  
  // Filter function to decide what to compress
  filter: (req: Request, res: Response) => {
    // Don't compress responses with this request header
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression filter function
    return compression.filter(req, res);
  },
});
