import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

function hasName(err: unknown, name: string): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === name;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;
}

// Nunca se devuelve el stack trace al cliente (tampoco en desarrollo): solo se registra en el log.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', issues: err.issues });
    return;
  }
  if (hasName(err, 'CastError')) {
    res.status(400).json({ error: 'Invalid ID' });
    return;
  }
  if (isDuplicateKeyError(err)) {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
