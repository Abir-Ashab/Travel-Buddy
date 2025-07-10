import { TUser } from "../interfaces/user.interface";
import { userModel } from "../repositories/user.repository";
import { USER_Role } from "../interfaces/user.interface";
import { CloudinaryService } from "./cloudinary.service";

const createAdminIntoDB = async (payload: TUser) => {
  const admin = await userModel.create(payload);
  return admin;
};

const updateUserStatus = async (_id: string, payload: TUser) => {
  const user = await userModel.updateById(_id, payload);
  return user;
};

const updateUser = async (_id: string, payload: TUser, file: Express.Multer.File) => {
  const user = await userModel.findById(_id);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role === USER_Role.EXPLORER || user.role === USER_Role.TRAVELER) {
    const { status, ...rest } = payload;
    payload = rest as TUser;
  }
  const uploadResult = await CloudinaryService.uploadImage(file);
  payload.profile_picture = uploadResult.secure_url
  const updatedUser = await userModel.updateById(_id, payload);
  return updatedUser;
};

const getUserProfile = async (userId: string) => {
  const user = await userModel.findById(userId);
  return user;
};

const getTravelers = async () => {
  const user = await userModel.findUsers();
  return user;
};

const getAllUser = async () => {
  const user = await userModel.findTravelers();
  return user;
};

const deleteUser = async (userId: string) => {
  await userModel.deleteById(userId);
};

export const UserServices = {
  createAdminIntoDB,
  updateUser,
  getUserProfile,
  getTravelers,
  getAllUser,
  deleteUser,
  updateUserStatus
};
