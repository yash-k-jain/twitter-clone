import express from "express";
import protectedRoute from "../lib/middlewares/protectedRoute.js";
import { signup, login, logout, getMe } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/me", protectedRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
