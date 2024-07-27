import express from "express";
import protectedRoute from "../lib/middlewares/protectedRoute.js";
import { getUserProfile, followUnfollowUser, getSuggestions, updateUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:userName", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestions)
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateUserProfile)

export default router;
