import Redis from 'ioredis';
import { config } from './index.js';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on('error', (err) => {
  console.error('Erreur Redis :', err.message);
});

redis.on('connect', () => {
  console.log('Redis connecte');
});
