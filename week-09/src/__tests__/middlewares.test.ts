// ============================================================
// UNIT TESTS — middlewares (authenticate, authorize, errorHandler) y utils/jwt
// ============================================================

import type { Request, Response } from 'express';
import { ZodError, z } from 'zod';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { errorHandler } from '../middlewares/error.middleware';
import { AppError } from '../errors/AppError';
import { signAccessToken, verifyAccessToken } from '../utils/jwt';

function mockRes(locals: Record<string, unknown> = {}) {
  const res = { locals, status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe('authenticate()', () => {
  it('should call next with AppError 401 when the Authorization header is missing', () => {
    const next = jest.fn();
    authenticate({ headers: {} } as Request, mockRes() as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should call next with AppError 401 when the token is invalid', () => {
    const next = jest.fn();
    const req = { headers: { authorization: 'Bearer not-a-token' } } as unknown as Request;
    authenticate(req, mockRes() as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 401 }));
  });

  it('should store the payload in res.locals and call next() with a valid token', () => {
    const next = jest.fn();
    const res = mockRes();
    const token = signAccessToken({ sub: 'user-1', role: 'admin' });
    authenticate({ headers: { authorization: `Bearer ${token}` } } as unknown as Request, res as unknown as Response, next);

    expect(res.locals['user']).toMatchObject({ sub: 'user-1', role: 'admin' });
    expect(next).toHaveBeenCalledWith();
  });
});

describe('authorize()', () => {
  it('should call next() when the user role is allowed', () => {
    const next = jest.fn();
    authorize('admin')({} as Request, mockRes({ user: { role: 'admin' } }) as unknown as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should call next with AppError 403 when the role is not allowed', () => {
    const next = jest.fn();
    authorize('admin')({} as Request, mockRes({ user: { role: 'user' } }) as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });

  it('should call next with AppError 403 when there is no user at all', () => {
    const next = jest.fn();
    authorize('admin')({} as Request, mockRes() as unknown as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 403 }));
  });
});

describe('errorHandler()', () => {
  const call = (err: unknown) => {
    const res = mockRes();
    errorHandler(err, {} as Request, res as unknown as Response, jest.fn());
    return res;
  };

  it('should answer with the AppError status code and message', () => {
    const res = call(new AppError(404, 'Not here'));

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not here' });
  });

  it('should answer 422 with the field errors for a ZodError', () => {
    let zodError: ZodError | undefined;
    try {
      z.object({ name: z.string() }).parse({});
    } catch (err) {
      zodError = err as ZodError;
    }
    const res = call(zodError);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Validation error', details: { name: [expect.any(String)] } }),
    );
  });

  it('should answer 500 without leaking details for an unknown error', () => {
    const res = call(new Error('secret database detail'));

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
  });
});

describe('utils/jwt', () => {
  it('should sign a token that verifyAccessToken can read back', () => {
    const token = signAccessToken({ sub: 'abc', role: 'user' });

    expect(verifyAccessToken(token)).toMatchObject({ sub: 'abc', role: 'user' });
  });

  it('should throw when the token was signed with another secret', () => {
    expect(() => verifyAccessToken('eyJhbGciOiJIUzI1NiJ9.e30.invalid')).toThrow();
  });
});
