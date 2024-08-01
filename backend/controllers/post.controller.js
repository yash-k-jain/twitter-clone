import { v2 as cloudinary } from "cloudinary";

import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notificaion.model.js";

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    console.error(`Error while getting all posts ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.error(`Error while getting liked posts ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  const { text } = req.body;
  let { image } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    if (!text && !image) {
      return res.status(400).json({ error: "Post must have a text or image." });
    }

    const newPost = new Post({
      user: req.user._id,
      text,
      image,
    });
    await newPost.save();

    return res.status(201).json(newPost);
  } catch (error) {
    console.error(`Error while creating post ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(`Error while deleting post ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const commentPost = async (req, res) => {
  const { text } = req.body;

  try {
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = { user: req.user._id, text };
    post.comments.push(comment);

    await post.save();

    return res.status(200).json(post);
  } catch (error) {
    console.error(`Error while commenting post ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLike = post.likes.includes(req.user._id);
    if (isLike) {
      await post.updateOne({ $pull: { likes: req.user._id } });
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { likedPost: req.params.id } }
      );

      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );

      return res.status(200).json(updatedLikes);
    } else {
      // await post.updateOne({ $push: { likes: req.user._id } });
      post.likes.push(req.user._id);
      await User.updateOne(
        { _id: req.user._id },
        { $push: { likedPosts: req.params.id } }
      );

      await post.save();

      const newNotification = new Notification({
        sender: req.user._id,
        receiver: post.user,
        type: "like",
      });

      await newNotification.save();

      const updatedLikes = post.likes;

      return res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.error(`Error while liking/unliking post ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingUserPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    return res.status(200).json(feedPosts);
  } catch (error) {
    console.error(`Error while getting following user posts ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ userName: req.params.userName });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userPosts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(`Error while getting user posts ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};
