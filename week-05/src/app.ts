import cors from 'cors';
import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import productsRouter from './routes/products.routes';

const app = express();

// La app de React Native (semana 05) consume esta API desde el navegador (web)
// y desde el emulador — habilita CORS para permitir esas peticiones.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/products', productsRouter);

app.use(notFound);
app.use(errorHandler);

export { app };
