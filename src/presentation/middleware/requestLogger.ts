import morgan from 'morgan';
import { Request, Response } from 'express';

// Extend the Request and Response types to include _startAt
declare module 'express' {
  interface Request {
    _startAt?: [number, number];
  }
  
  interface Response {
    _startAt?: [number, number];
  }
}

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req: Request, res: Response) => {
  if (!req._startAt || !res._startAt) {
    return '0';
  }
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
             (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(3);
});

// Development format
export const devLogger = morgan('dev');

// Production format with JSON output
export const prodLogger = morgan((tokens, req: Request, res: Response) => {
  // Safely get token values with fallbacks
  const getToken = (tokenName: string, ...args: string[]): string => {
    const token = tokens[tokenName as keyof morgan.TokenIndexer];
    if (typeof token === 'function') {
      const result = token(req, res, ...args);
      return result || '';
    }
    return '';
  };

  const logData = {
    method: getToken('method'),
    url: getToken('url'),
    status: getToken('status'),
    responseTime: `${getToken('response-time-ms')}ms`,
    contentLength: getToken('res', 'content-length'),
    timestamp: new Date().toISOString(),
    userAgent: getToken('user-agent'),
  };

  return JSON.stringify(logData);
});