import { Request, Response, NextFunction } from 'express';

// Reemplazo de express-mongo-sanitize, que revienta con Express 5 (intenta asignar
// req.query, que ahora es solo lectura). Elimina las claves que empiezan con "$"
// o contienen "." — así `{ "email": { "$gt": "" } }` no llega a Mongo como operador.
function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
        .map(([key, val]) => [key, clean(val)])
    );
  }
  return value;
}

export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  req.body = clean(req.body);
  // En Express 5 req.query es un getter: hay que redefinirlo para que el cambio persista
  Object.defineProperty(req, 'query', { value: clean(req.query), writable: true, configurable: true });
  next();
}
