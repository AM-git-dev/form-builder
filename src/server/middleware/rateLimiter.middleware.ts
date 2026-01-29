import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: {
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de requetes, reessayez plus tard',
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    data: null,
    error: {
      statusCode: 429,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Trop de tentatives, reessayez dans 15 minutes',
    },
  },
});
