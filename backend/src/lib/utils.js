import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateTokens = (userId, res) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");

  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });

  const cookieOptions = {
    httpOnly: true, // prevent XSS
    sameSite: "strict", // prevent CSRF
    secure: ENV.NODE_ENV !== "development",
  };

  res.cookie("jwt", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("jwt_refresh", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { accessToken, refreshToken };
};

// http://localhost
// https://dsmakmk.com
