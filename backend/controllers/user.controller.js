import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import Notification from "../models/notificaion.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  const { userName } = req.params;

  try {
    const user = await User.findOne({ userName }).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error while getting user profile ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const userFollowedByMe = await User.findById(req.user._id).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.user._id },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(`Error while getting suggestions ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const followUnfollowUser = async (req, res) => {
  const { id } = req.params;

  try {
    const currentUser = await User.findById(req.user._id);
    const userToModify = await User.findById(id);

    if (id.toString() === req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    if (!currentUser || !userToModify) {
      return res.status(404).json({ error: "User not found" });
    }

    if (currentUser.following.includes(id)) {
      await currentUser.updateOne({ $pull: { following: id } });
      await userToModify.updateOne({ $pull: { followers: req.user._id } });

      //Send notification to the user
      const newNotification = new Notification({
        sender: currentUser._id,
        receiver: userToModify._id,
        type: "follow",
      });
      await newNotification.save();
      return res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      await currentUser.updateOne({ $push: { following: id } });
      await userToModify.updateOne({ $push: { followers: req.user._id } });

      //Send notification to the user

      const newNotification = new Notification({
        sender: currentUser._id,
        receiver: userToModify._id,
        type: "follow",
      });
      await newNotification.save();
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.error(`Error while following/unfollowing user ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullName, email, userName, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImage, coverImage } = req.body;

  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Please provide both current and new password" });
    }
    if (newPassword && currentPassword) {
      const isPasswordMatched = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordMatched) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (profileImage) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }
      const uploadResult = await cloudinary.uploader.upload(profileImage);
      user.profileImage = uploadResult.secure_url;
    }

    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(
          user.coverImage.split("/").pop().split(".")[0]
        );
      }
      const uploadResult = await cloudinary.uploader.upload(coverImage);
      user.coverImage = uploadResult.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.userName = userName || user.userName;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();

    user.password = null;

    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error while updating user profile ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};
