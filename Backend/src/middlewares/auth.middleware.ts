import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { USER_Role, USER_STATUS } from "../interfaces/user.interface";
import { catchAsync } from "../utils/catchAsync.util";
import { userModel } from "../repositories/user.repository";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { NotFoundError } from "../errors/NotFoundError";
import { ForbiddenError } from "../errors/ForbiddenError";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (...requiredRoles: (typeof USER_Role)[keyof typeof USER_Role][]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedError("Access token missing. You must be logged in.");
    }

    let verfiedToken: JwtPayload;
    try {
      verfiedToken = jwt.verify(
        accessToken as string,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired token. Please log in again.");
    }

    const { role, email, user_id } = verfiedToken;

    const user = await userModel.findByEmail(email);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.status === USER_STATUS.BLOCKED) {
      throw new ForbiddenError("Your account is blocked. Contact support.");
    }

    if (!requiredRoles.includes(role)) {
      throw new ForbiddenError("You do not have permission to access this resource.");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();
  });
};