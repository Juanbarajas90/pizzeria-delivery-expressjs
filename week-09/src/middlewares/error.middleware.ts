import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

// Los schemas validan { body | params | query }, así que flatten().fieldErrors dejaba todos los
// mensajes bajo la clave "body" sin decir de qué campo. Aquí se agrupan por campo: { price: [...] }.
function fieldErrors(err: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const [root, ...rest] = issue.path.map(String);
    const field = (['body', 'params', 'query'].includes(root ?? '') ? rest : [root, ...rest]).join('.');
    (details[field || 'body'] ??= []).push(issue.message);
  }
  return details;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof ZodError) {
    res.status(422).json({ error: 'Validation error', details: fieldErrors(err) });
    return;
  }
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
};
