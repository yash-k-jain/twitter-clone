import express from "express";
import protectedRoute from "../lib/middlewares/protectedRoute.js";
import { createPost, deletePost, commentPost, likeUnlikePost, getAllPosts, getLikedPosts, getFollowingUserPosts, getUserPosts } from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPosts)
router.get("/user/:userName", protectedRoute, getUserPosts)
router.get("/followingUserPost", protectedRoute, getFollowingUserPosts)
router.get("/likes/:id", protectedRoute, getLikedPosts)
router.post("/create", protectedRoute, createPost)
router.post("/like/:id", protectedRoute, likeUnlikePost)
router.post("/comment/:id", protectedRoute, commentPost)
router.delete("/delete/:id", protectedRoute, deletePost)

export default router