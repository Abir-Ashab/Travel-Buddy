import { TUser } from "./user.interface";
import { User } from "./user.model";
import KnexConnection from '../../src/database/implementations/knex/KnexConnection';
import { createUserModel } from "./user.model";
const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient(); // This returns this.client
const userModel = createUserModel(knexInstance);

const createAdminIntoDB = async (payload: TUser) => {
  const admin = await userModel.create(payload);
  return admin;
};
const updateUser = async (_id: string, payload: TUser) => {
  const admin = await userModel.updateById({ _id }, payload);
  return admin;
};

export const UserServices = {
  createAdminIntoDB,
  updateUser,
};
