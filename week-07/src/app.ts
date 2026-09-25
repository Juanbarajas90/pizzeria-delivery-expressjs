import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import productRouter from './routes/product.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);

// Middlewares de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);
