import { app } from './app';
import { logger } from './config/logger';
import { prisma } from './lib/prisma';

const PORT = Number(process.env['PORT']) || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📘 Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
});

function shutdown(): void {
  server.close(() => {
    prisma.$disconnect().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
