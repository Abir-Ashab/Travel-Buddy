import { isPasswordMatched } from "./auth.util";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { USER_Role } from "../user/user.constants";
import { TUser } from "../user/user.interface";
import { TLoginUser } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../src/config";
import KnexConnection from '../../src/database/implementations/knex/KnexConnection';
import { createUserModel } from "../user/user.model";
import { log } from "console";
const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient(); // This returns this.client
const userModel = createUserModel(knexInstance);

const register = async (payload: TUser): Promise<any> => {
  //user existence check
  const email = payload.email;
  const user = await userModel.findByEmail(email);
  if (user) {
    throw new Error("User already exists");
  }

  //set user role
  payload.role = USER_Role.USER;

  //create user
  const newUser = await userModel.create(payload);

  return newUser;
};

const login = async (payload: TLoginUser) => {
  console.log("payload", payload);
  const email = payload.email;
  console.log("email", email);

  const user = await userModel.findByEmailWithPassword(email);
  console.log("user", user);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.status === "BLOCKED") {
    throw new Error("User is blocked");
  }

  const passwordMatch = await isPasswordMatched(
    payload.password,
    user.password
  );

  if (!passwordMatch) {
    throw new Error("Password not matched");
  }

  const jwtPayload = {
    email: user.email,
    role: user.role,
  };

  console.log("jwtPayload", jwtPayload);
  
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: config.jwt_access_expires_in,
  });

  const refreshToken = jwt.sign(jwtPayload, config.jwt_refresh_secret as string, {
      expiresIn: config.jwt_refresh_expires_in,
  });
  
  return {
    accessToken,
    refreshToken,
  };
};
export const AuthServices = {
  register,
  login,
};
