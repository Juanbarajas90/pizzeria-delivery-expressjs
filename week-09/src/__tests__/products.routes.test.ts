// ============================================================
// INTEGRATION TESTS — /api/v1/products
// ============================================================
// Ciclo completo con Supertest + MongoDB Memory Server (base real en memoria).

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../app';
import { createAdminToken, createUserToken } from './helpers/auth';

let mongod: MongoMemoryServer;
let ownerToken: string;
let otherToken: string;
let adminToken: string;

const margarita = { name: 'Pizza Margarita', price: 32000, category: 'pizza' };
const NON_EXISTENT_ID = '64b7f0c2a1b2c3d4e5f60718';

async function createProduct(body: Record<string, unknown> = margarita, token = ownerToken) {
  return request(app).post('/api/v1/products').set('Authorization', `Bearer ${token}`).send(body);
}

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

// Los usuarios (y sus tokens) se crean una sola vez; cada test
// empieza con la colección de productos vacía.
beforeEach(async () => {
  await mongoose.connection.collection('products').deleteMany({});
  if (!ownerToken) {
    ownerToken = await createUserToken('owner@pizza.com');
    otherToken = await createUserToken('other@pizza.com');
    adminToken = await createAdminToken('admin@pizza.com');
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('Products Routes — Integration Tests', () => {
  describe('GET /api/v1/products', () => {
    it('should return 200 and an empty array initially (public route)', async () => {
      const res = await request(app).get('/api/v1/products');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: [], total: 0 });
    });

    it('should filter by category', async () => {
      await createProduct(margarita);
      await createProduct({ name: 'Coca-Cola 400ml', price: 6000, category: 'drink' });

      const res = await request(app).get('/api/v1/products?category=drink');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Coca-Cola 400ml');
    });

    it('should return 422 for an unknown category', async () => {
      const res = await request(app).get('/api/v1/products?category=sushi');

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should return 201 with valid data and token, and apply defaults', async () => {
      const res = await createProduct();

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({ ...margarita, available: true, prepTimeMinutes: 15 });
      expect(res.body.data._id).toEqual(expect.any(String));
    });

    it('should return 401 without token', async () => {
      const res = await request(app).post('/api/v1/products').send(margarita);

      expect(res.status).toBe(401);
    });

    it('should return 401 with an invalid token', async () => {
      const res = await createProduct(margarita, 'not-a-token');

      expect(res.status).toBe(401);
    });

    it('should return 422 with invalid data (negative price, unknown category)', async () => {
      const res = await createProduct({ name: 'X', price: -5, category: 'sushi' });

      expect(res.status).toBe(422);
      expect(res.body.details).toHaveProperty('price');
      expect(res.body.details).toHaveProperty('category');
    });

    it('should return 409 when the name already exists', async () => {
      await createProduct();
      const res = await createProduct();

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should return 200 with an existing product', async () => {
      const created = await createProduct();

      const res = await request(app).get(`/api/v1/products/${created.body.data._id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Pizza Margarita');
    });

    it('should return 404 with a non-existent id', async () => {
      const res = await request(app).get(`/api/v1/products/${NON_EXISTENT_ID}`);

      expect(res.status).toBe(404);
    });

    it('should return 422 with a malformed id', async () => {
      const res = await request(app).get('/api/v1/products/abc');

      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should return 200 when the owner updates', async () => {
      const created = await createProduct();

      const res = await request(app)
        .put(`/api/v1/products/${created.body.data._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ price: 35000, available: false });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({ price: 35000, available: false, name: 'Pizza Margarita' });
    });

    it('should return 200 when an admin updates a product of someone else', async () => {
      const created = await createProduct();

      const res = await request(app)
        .put(`/api/v1/products/${created.body.data._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 1000 });

      expect(res.status).toBe(200);
    });

    it('should return 403 when a non-owner tries to update', async () => {
      const created = await createProduct();

      const res = await request(app)
        .put(`/api/v1/products/${created.body.data._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ price: 1 });

      expect(res.status).toBe(403);
    });

    it('should return 404 when the product does not exist', async () => {
      const res = await request(app)
        .put(`/api/v1/products/${NON_EXISTENT_ID}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ price: 1000 });

      expect(res.status).toBe(404);
    });

    it('should return 422 with invalid data', async () => {
      const created = await createProduct();

      const res = await request(app)
        .put(`/api/v1/products/${created.body.data._id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ price: 'gratis' });

      expect(res.status).toBe(422);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should return 204 when the owner deletes, and the product is gone', async () => {
      const created = await createProduct();
      const id = created.body.data._id;

      const res = await request(app).delete(`/api/v1/products/${id}`).set('Authorization', `Bearer ${ownerToken}`);
      const after = await request(app).get(`/api/v1/products/${id}`);

      expect(res.status).toBe(204);
      expect(after.status).toBe(404);
    });

    it('should return 204 when an admin deletes a product of someone else', async () => {
      const created = await createProduct();

      const res = await request(app)
        .delete(`/api/v1/products/${created.body.data._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 403 when a non-owner (not admin) tries to delete, and the product stays', async () => {
      const created = await createProduct();
      const id = created.body.data._id;

      const res = await request(app).delete(`/api/v1/products/${id}`).set('Authorization', `Bearer ${otherToken}`);
      const after = await request(app).get(`/api/v1/products/${id}`);

      expect(res.status).toBe(403);
      expect(after.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).delete(`/api/v1/products/${NON_EXISTENT_ID}`);

      expect(res.status).toBe(401);
    });
  });
});
