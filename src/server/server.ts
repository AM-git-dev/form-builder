import 'dotenv/config';
import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './config/database.js';
import { redis } from './config/redis.js';
import { logger } from './utils/logger.js';

const PORT = config.PORT;

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Base de donnees PostgreSQL connectee');

    await redis.ping();
    logger.info('Cache Redis connecte');

    app.listen(PORT, () => {
      logger.info(`Serveur demarre sur le port ${PORT}`, {
        env: config.NODE_ENV,
        url: `http://localhost:${PORT}`,
      });
    });
  } catch (error) {
    logger.error('Echec du demarrage du serveur', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Arret du serveur...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Arret du serveur...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});

bootstrap();
