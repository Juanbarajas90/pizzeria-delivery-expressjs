import { UserModel, type IUser } from '../models/user.model.js';

export async function findUserByEmail(email: string): Promise<IUser | null> {
  return UserModel.findOne({ email }).lean<IUser>().exec();
}

export async function createUser(
  data: Pick<IUser, 'name' | 'email' | 'password' | 'role'>,
): Promise<IUser> {
  const user = new UserModel(data);
  // toObject(): un documento de Mongoose no es un objeto plano; al hacerle spread se filtraban
  // sus campos internos y el hash de la contraseña (_doc) en la respuesta de /register.
  return (await user.save()).toObject() as unknown as IUser;
}

export async function findUserById(id: string): Promise<IUser | null> {
  return UserModel.findById(id).lean<IUser>().exec();
}
