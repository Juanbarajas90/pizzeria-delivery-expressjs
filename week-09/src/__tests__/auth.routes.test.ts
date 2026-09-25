// ============================================================
// INTEGRATION TESTS — /api/v1/auth y /api/v1/health
// ============================================================

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';

let mongod: MongoMemoryServer;

const juan = { name: 'Juan', email: 'juan@pizza.com', password: 'Password1' };

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  await mongoose.connection.collection('users').deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Auth Routes — Integration Tests', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 201, role "user", and never expose the password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send(juan);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ email: 'juan@pizza.com', role: 'user' });
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should ignore a role sent by the client (no self-promotion to admin)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...juan, role: 'admin' });

      expect(res.body.data.role).toBe('user');
    });

    it('should return 409 when the email already exists', async () => {
      await request(app).post('/api/v1/auth/register').send(juan);
      const res = await request(app).post('/api/v1/auth/register').send(juan);

      expect(res.status).toBe(409);
    });

    it('should return 422 with a weak password', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({ ...juan, password: 'abc' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(juan);
    });

    it('should return 200 with an access token', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: juan.email, password: juan.password });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toEqual(expect.any(String));
    });

    it('should return 401 with a wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: juan.email, password: 'Wrong123' });

      expect(res.status).toBe(401);
    });

    it('should return 401 with an unknown email, with the same message as a wrong password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'no@pizza.com', password: 'Password1' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 422 with a malformed body', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'not-an-email' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return the current user with a valid token', async () => {
      await request(app).post('/api/v1/auth/register').send(juan);
      const login = await request(app).post('/api/v1/auth/login').send({ email: juan.email, password: juan.password });

      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ email: 'juan@pizza.com' });
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 404 when the token is valid but the user was deleted', async () => {
      await request(app).post('/api/v1/auth/register').send(juan);
      const login = await request(app).post('/api/v1/auth/login').send({ email: juan.email, password: juan.password });
      await mongoose.connection.collection('users').deleteMany({});

      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`);

      expect(res.status).toBe(404);
    });
  });
});
