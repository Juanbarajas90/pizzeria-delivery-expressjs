import { createApp } from './app.js';

const PORT = process.env.PORT ?? '3000';
const app = createApp();

const server = app.listen(Number(PORT), () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received: closing server gracefully`);
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
