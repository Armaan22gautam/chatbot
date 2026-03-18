import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateTokens } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";
import { catchAsync } from "../lib/catchAsync.js";
import { signupSchema, loginSchema, updateProfileSchema } from "../lib/validations.js";

export const signup = catchAsync(async (req, res) => {
  // Zod validation
  const validatedData = signupSchema.parse(req.body);
  const { fullName, email, password } = validatedData;
  
  const user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // before CR:
      // generateToken(newUser._id, res);
      // await newUser.save();

      // after CR:
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateTokens(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});

export const login = catchAsync(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const { email, password } = validatedData;

  const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateTokens(user._id, res);

  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
  });
});

export const logout = catchAsync(async (_, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.cookie("jwt_refresh", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
});

export const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies.jwt_refresh;
  if (!token) return res.status(401).json({ message: "Unauthorized - No refresh token" });

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    generateTokens(decoded.userId, res);
    res.status(200).json({ message: "Tokens refreshed successfully" });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized - Invalid refresh token" });
  }
});

export const updateProfile = catchAsync(async (req, res) => {
  const validatedData = updateProfileSchema.parse(req.body);
  const { profilePic } = validatedData;
  const userId = req.user._id;

  const uploadResponse = await cloudinary.uploader.upload(profilePic);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResponse.secure_url },
    { new: true }
  );

  res.status(200).json(updatedUser);
});
