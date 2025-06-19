import express from "express";
import { authControllers } from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.get("/refresh-token", authControllers.refreshToken);

export const AuthRoutes = router;

