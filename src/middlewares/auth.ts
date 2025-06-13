import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import { USER_Role, USER_STATUS } from "../interfaces/user.interface";
import { catchAsync } from "../utils/catchAsync";
import { createUserModel } from "../models/user.model";
import KnexConnection from '..//database/implementations/knex/KnexConnection';
const knexConnection = new KnexConnection();
await knexConnection.connect();

const knexInstance = knexConnection.getClient(); // This returns this.client
const userModel = createUserModel(knexInstance);

<<<<<<< HEAD
export const authMiddleware = (...requiredRoles: (keyof typeof USER_Role)[]) => {
=======
export const auth = (...requiredRoles: (keyof typeof USER_Role)[]) => {
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new AppError(401, "You are not authorized to access this route");
    }

    const verfiedToken = jwt.verify(
      accessToken as string,
      config.jwt_access_secret as string
    );

    console.log("verfiedToken", verfiedToken);
    
    const { role, email } = verfiedToken as JwtPayload;
    console.log(email, role);
    const user = await userModel.findByEmail(email);
    console.log("user", user);
    if (!user) {
      throw new AppError(401, "User not found");
    }

    if (user.status === USER_STATUS.BLOCKED) {
      throw new AppError(401, "User is blocked");
    }

    if (!requiredRoles.includes(role)) {
      throw new AppError(401, "You are not authorized to access this route");
    }
    next();
  });
};
