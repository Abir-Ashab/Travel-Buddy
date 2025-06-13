import { TUser } from "../interfaces/user.interface";
import { User } from "../models/user.model";
import KnexConnection from '../database/implementations/knex/KnexConnection';
import { createUserModel } from "../models/user.model";
import { USER_Role } from "../interfaces/user.interface";
const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient(); // This returns this.client
const userModel = createUserModel(knexInstance);

const createAdminIntoDB = async (payload: TUser) => {
  const admin = await userModel.create(payload);
  return admin;
};
const updateUser = async (_id: string, payload: TUser) => {
  const user = await userModel.updateById({ _id }, payload);
  return user;
};
// user profile
const getUserProfile = async (userId: string) => {
  const user = await userModel.findById(userId);
  return user;
};

// delete account
const deleteUser = async (userId: string) => {
  await userModel.deleteById(userId);
};

// upgrade to traveler
const upgradeToTraveler = async (userId: number) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  await userModel.updateById(userId, {
    role: USER_Role.TRAVELER,
  });

  return {
    ...user,
    role: USER_Role.TRAVELER,
  };
};

export const UserServices = {
  createAdminIntoDB,
  updateUser,
  getUserProfile,
  deleteUser,
  upgradeToTraveler,
};
