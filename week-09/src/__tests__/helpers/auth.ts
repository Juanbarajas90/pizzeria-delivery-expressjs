import request from 'supertest';
import bcrypt from 'bcrypt';
import { app } from '../../app';
import { UserModel } from '../../models/user.model';

const PASSWORD = 'Password1';

/** Registra un usuario normal por la API y devuelve su access token. */
export async function createUserToken(email: string): Promise<string> {
  await request(app).post('/api/v1/auth/register').send({ name: 'Cliente', email, password: PASSWORD });
  const login = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD });
  return login.body.accessToken as string;
}

/** El registro siempre crea rol "user", así que el admin se inserta directo en la base. */
export async function createAdminToken(email: string): Promise<string> {
  await UserModel.create({
    name: 'Admin',
    email,
    password: await bcrypt.hash(PASSWORD, 4),
    role: 'admin',
  });
  const login = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD });
  return login.body.accessToken as string;
}
