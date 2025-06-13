import express from "express";
import { authControllers } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { USER_Role } from "../interfaces/user.interface";

const router = express.Router();

router.post("/register", authControllers.register);
router.post("/login", authMiddleware(USER_Role.EXPLORER, USER_Role.TRAVELER), authControllers.login);

export const AuthRoutes = router;

//login /api/auth/login
//register /api/auths/create-student : /api/auth/register
//forgot password /api/auth/forgot-password
//refresh token /api/auth/refresh-token
