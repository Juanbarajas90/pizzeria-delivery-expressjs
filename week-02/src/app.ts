import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import { productsRouter } from './routes/products.routes.js';

export function createApp(): Application {
  const app = express();

  // 1. Parseo de body — requerido para POST/PUT
  app.use(express.json());

  // 2. Logger personalizado — método, ruta, status y duración
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // 3. Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 4. Rutas del recurso principal
  app.use('/api/v1/products', productsRouter);

  // 5. Handler para rutas no encontradas
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // 6. Error handler global — siempre el último app.use()
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  });

  return app;
}
