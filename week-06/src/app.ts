import cors from 'cors';
import express from 'express';
import categoriesRouter from './routes/categories.routes';
import productsRouter from './routes/products.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const app = express();

// La app de React Native (semana 06) consume esta API desde el navegador — habilita CORS.
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1/categories', categoriesRouter);
app.use('/api/v1/products', productsRouter);

app.use(notFound);
app.use(errorHandler);
