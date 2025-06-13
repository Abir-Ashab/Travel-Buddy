<<<<<<< HEAD
import express from "express";
import { authMiddleware } from "../middlewares/auth";
=======
//  /create-admin, superAdmin,admin post
// /:userid- admin, superadmin put
// /:userid-  get
// /me - user own data. put
//

import express from "express";
import { auth } from "../middlewares/auth";
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
import validateRequest from "../middlewares/validateRequest";
import { USER_Role } from "../interfaces/user.interface";
import { userControllers } from "../controllers/user.controller";
import { UserValidations } from "../validations/user.validation";

const router = express.Router();

router.post(
  "/create-admin",
  validateRequest(UserValidations.createAdminValidations),
<<<<<<< HEAD
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN),
  userControllers.createAdmin
);

router.put(
  "/me",
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
  validateRequest(UserValidations.updateUserValidations),
  userControllers.updateUser
);

// get user profile
// router.get(
//   "/me",
//   auth(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
//   userControllers.getUserProfile
// );

// delete account
router.delete(
  "/account",
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
  userControllers.deleteUser
);

// upgrade to traveler
router.put(
  "/upgrade",
  authMiddleware(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.EXPLORER),
  userControllers.upgradeToTraveler
);

export const UserRoutes = router;
=======
  auth(USER_Role.ADMIN, USER_Role.SUPER_ADMIN),
  userControllers.createAdmin
);

//update
router.put(
  "/:userId",
  auth(USER_Role.ADMIN, USER_Role.SUPER_ADMIN),
  validateRequest(UserValidations.updateUserValidations),
  userControllers.updateUser
);
// router.put(
//   "/me",
//   auth(USER_Role.ADMIN, USER_Role.SUPER_ADMIN, USER_Role.USER),
//   validateRequest(UserValidations.updateUserValidations),
//   userControllers.updateUser
// );

export const UserRoutes = router;

//login /api/auth/login
//register /api/users/create-student : /api/auth/register
//forgot password /api/auth/forgot-password
//refresh token /api/auth/refresh-token
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
