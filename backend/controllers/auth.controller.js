import User from "../models/user.model.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { userName, fullName, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUserName = await User.findOne({ userName });
    if (existingUserName) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      userName,
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImage: newUser.profileImage,
        coverImage: newUser.coverImage,
      });
    } else {
      return res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.error(`Error while signing up ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { password, userName } = req.body;

    const user = await User.findOne({ userName });
    const isPasswordMatched = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordMatched) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    generateTokenAndSetCookie(user._id, res);
    return res.status(200).json({
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
    });
  } catch (error) {
    console.error(`Error while logging in ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`Error while logging out ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error while getting me ${error.message}`);
    return res.status(500).json({ error: "Internal server error" });
  }
}