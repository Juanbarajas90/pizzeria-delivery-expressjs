import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

function hasName(err: unknown, name: string): boolean {
  return typeof err === 'object' && err !== null && (err as { name?: unknown }).name === name;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: unknown }).code === 11000;
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Datos inválidos', issues: err.issues });
    return;
  }

  if (hasName(err, 'CastError')) {
    res.status(400).json({ error: 'ID inválido' });
    return;
  }

  if (isDuplicateKeyError(err)) {
    res.status(409).json({ error: 'El registro ya existe' });
    return;
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
