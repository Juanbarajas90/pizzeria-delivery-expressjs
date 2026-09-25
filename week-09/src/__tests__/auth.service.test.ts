// ============================================================
// UNIT TESTS — auth.service.ts
// ============================================================
// El repositorio de usuarios y bcrypt se mockean: se prueba solo la lógica del servicio.

jest.mock('../repositories/users.repository');
jest.mock('bcrypt');

import bcrypt from 'bcrypt';
import * as usersRepo from '../repositories/users.repository';
import * as authService from '../services/auth.service';
import { verifyAccessToken } from '../utils/jwt';
import type { IUser } from '../models/user.model';

const mockFindByEmail = usersRepo.findUserByEmail as jest.MockedFunction<typeof usersRepo.findUserByEmail>;
const mockFindById = usersRepo.findUserById as jest.MockedFunction<typeof usersRepo.findUserById>;
const mockCreateUser = usersRepo.createUser as jest.MockedFunction<typeof usersRepo.createUser>;
const mockHash = bcrypt.hash as unknown as jest.Mock;
const mockCompare = bcrypt.compare as unknown as jest.Mock;

const storedUser = {
  _id: 'user-id-1',
  name: 'Juan',
  email: 'juan@pizza.com',
  password: 'hashed-password',
  role: 'user',
} as unknown as IUser;

describe('AuthService — Unit Tests', () => {
  describe('register()', () => {
    const dto = { name: 'Juan', email: 'juan@pizza.com', password: 'Password1' };

    it('should hash the password, force role "user" and not return the password', async () => {
      mockFindByEmail.mockResolvedValue(null);
      mockHash.mockResolvedValue('hashed-password');
      mockCreateUser.mockResolvedValue(storedUser);

      const result = await authService.register(dto);

      expect(mockCreateUser).toHaveBeenCalledWith({ ...dto, password: 'hashed-password', role: 'user' });
      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ email: 'juan@pizza.com', role: 'user' });
    });

    it('should throw AppError 409 when the email is already registered', async () => {
      mockFindByEmail.mockResolvedValue(storedUser);

      await expect(authService.register(dto)).rejects.toMatchObject({ statusCode: 409 });
      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    it('should return a valid access token with the user id and role', async () => {
      mockFindByEmail.mockResolvedValue(storedUser);
      mockCompare.mockResolvedValue(true);

      const { accessToken } = await authService.login({ email: 'juan@pizza.com', password: 'Password1' });

      expect(verifyAccessToken(accessToken)).toMatchObject({ sub: 'user-id-1', role: 'user' });
    });

    it('should throw AppError 401 when the email does not exist', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(authService.login({ email: 'no@pizza.com', password: 'x' })).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    });

    it('should throw AppError 401 with the same message when the password is wrong', async () => {
      mockFindByEmail.mockResolvedValue(storedUser);
      mockCompare.mockResolvedValue(false);

      await expect(authService.login({ email: 'juan@pizza.com', password: 'bad' })).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid credentials',
      });
    });
  });

  describe('getMe()', () => {
    it('should return the user without the password', async () => {
      mockFindById.mockResolvedValue(storedUser);

      const result = await authService.getMe('user-id-1');

      expect(result).not.toHaveProperty('password');
      expect(result).toMatchObject({ email: 'juan@pizza.com' });
    });

    it('should throw AppError 404 when the user does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(authService.getMe('missing')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
