import rateLimit from 'express-rate-limit';
import { CorsOptions } from 'cors';
import { AppError } from '../errors/AppError.js';

// Global limiter — all endpoints: 100 req / 15 min
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

// Auth limiter — login/register only: 5 req / 15 min (brute force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

// CORS whitelist — add your frontend origin here
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3001',
  'http://localhost:8081', // Expo web (app React Native)
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError(403, `CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
