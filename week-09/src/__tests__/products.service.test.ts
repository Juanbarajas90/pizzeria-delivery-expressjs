// ============================================================
// UNIT TESTS — products.service.ts
// ============================================================
// El repositorio se mockea: aquí solo se prueba la lógica de negocio del servicio.

jest.mock('../repositories/products.repository');

import * as productsRepo from '../repositories/products.repository';
import * as productsService from '../services/products.service';
import type { IProduct } from '../models/product.model';

const mockFindAll = productsRepo.findAllProducts as jest.MockedFunction<typeof productsRepo.findAllProducts>;
const mockFindById = productsRepo.findProductById as jest.MockedFunction<typeof productsRepo.findProductById>;
const mockFindByName = productsRepo.findProductByName as jest.MockedFunction<typeof productsRepo.findProductByName>;
const mockCreate = productsRepo.createProduct as jest.MockedFunction<typeof productsRepo.createProduct>;
const mockUpdate = productsRepo.updateProduct as jest.MockedFunction<typeof productsRepo.updateProduct>;
const mockDelete = productsRepo.deleteProduct as jest.MockedFunction<typeof productsRepo.deleteProduct>;

const margarita = {
  _id: 'product-id-123',
  name: 'Pizza Margarita',
  description: 'Tomate, mozzarella y albahaca',
  price: 32000,
  category: 'pizza',
  available: true,
  prepTimeMinutes: 15,
  createdBy: 'owner-id',
} as unknown as IProduct;

const dto = { name: 'Pizza Margarita', price: 32000, category: 'pizza' as const };

describe('ProductsService — Unit Tests', () => {
  describe('getAll()', () => {
    it('should return all products', async () => {
      mockFindAll.mockResolvedValue([margarita]);

      const result = await productsService.getAll();

      expect(result).toEqual([margarita]);
      expect(mockFindAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass the category filter to the repository', async () => {
      mockFindAll.mockResolvedValue([]);

      const result = await productsService.getAll('drink');

      expect(result).toEqual([]);
      expect(mockFindAll).toHaveBeenCalledWith('drink');
    });
  });

  describe('getById()', () => {
    it('should return the product when it exists', async () => {
      mockFindById.mockResolvedValue(margarita);

      await expect(productsService.getById('product-id-123')).resolves.toBe(margarita);
    });

    it('should throw AppError 404 when the product does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(productsService.getById('missing')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Product not found',
      });
    });
  });

  describe('create()', () => {
    it('should create the product with the requester as owner', async () => {
      mockFindByName.mockResolvedValue(null);
      mockCreate.mockResolvedValue(margarita);

      const result = await productsService.create(dto, 'owner-id');

      expect(result).toBe(margarita);
      expect(mockCreate).toHaveBeenCalledWith(dto, 'owner-id');
    });

    it('should throw AppError 409 when the name already exists', async () => {
      mockFindByName.mockResolvedValue(margarita);

      await expect(productsService.create(dto, 'owner-id')).rejects.toMatchObject({ statusCode: 409 });
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should update the product when the requester is the owner', async () => {
      const updated = { ...margarita, price: 35000 } as unknown as IProduct;
      mockFindById.mockResolvedValue(margarita);
      mockUpdate.mockResolvedValue(updated);

      const result = await productsService.update('product-id-123', { price: 35000 }, 'owner-id', 'user');

      expect(result).toBe(updated);
      expect(mockUpdate).toHaveBeenCalledWith('product-id-123', { price: 35000 });
    });

    it('should update the product when the requester is an admin (not the owner)', async () => {
      mockFindById.mockResolvedValue(margarita);
      mockUpdate.mockResolvedValue(margarita);

      await expect(
        productsService.update('product-id-123', { available: false }, 'other-id', 'admin'),
      ).resolves.toBe(margarita);
    });

    it('should throw AppError 403 when the requester is not the owner nor admin', async () => {
      mockFindById.mockResolvedValue(margarita);

      await expect(
        productsService.update('product-id-123', { price: 1 }, 'other-id', 'user'),
      ).rejects.toMatchObject({ statusCode: 403 });
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw AppError 404 when the product does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(
        productsService.update('missing', { price: 1 }, 'owner-id', 'user'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw AppError 404 when the product disappears before being updated', async () => {
      mockFindById.mockResolvedValue(margarita);
      mockUpdate.mockResolvedValue(null);

      await expect(
        productsService.update('product-id-123', { price: 1 }, 'owner-id', 'user'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('remove()', () => {
    it('should delete the product when the requester is an admin', async () => {
      mockFindById.mockResolvedValue(margarita);
      mockDelete.mockResolvedValue(margarita);

      await expect(productsService.remove('product-id-123', 'other-id', 'admin')).resolves.toBeUndefined();
      expect(mockDelete).toHaveBeenCalledWith('product-id-123');
    });

    it('should throw AppError 403 when the requester is not the owner nor admin', async () => {
      mockFindById.mockResolvedValue(margarita);

      await expect(productsService.remove('product-id-123', 'other-id', 'user')).rejects.toMatchObject({
        statusCode: 403,
      });
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should throw AppError 404 when the product does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(productsService.remove('missing', 'owner-id', 'admin')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
