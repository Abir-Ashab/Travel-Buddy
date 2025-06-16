import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import validateRequest from "../middlewares/validateRequest";
import { USER_Role } from "../interfaces/user.interface";
import { userControllers } from "../controllers/user.controller";
import { UserValidations } from "../validations/user.validation";

const router = express.Router();

router.post(
  "/create-admin",
  validateRequest(UserValidations.createAdminValidations),
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN),
  userControllers.createAdmin
);

router.put(
  "/me",
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
  validateRequest(UserValidations.updateUserValidations),
  userControllers.updateUser
);

router.delete(
  "/account",
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
  userControllers.deleteUser
);

router.put(
  "/upgrade",
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
  userControllers.upgradeToTraveler
);

export const UserRoutes = router;
