import { SignToken } from "../utils/jwt.js";

export const sendToken = (res, user, statusCode = 200) => {
  const token = SignToken(user);

  const cookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-site in production
    secure: process.env.NODE_ENV === "production", // true for HTTPS
    maxAge: 1 * 60 * 60 * 1000, // 1 hour (ms)
    path: "/",
    domain: process.env.NODE_ENV === "production" ? undefined : undefined, // let browser handle domain
  };

  // set cookie and send basic user info (no password)
  return res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      message: statusCode === 201 ? "User registered" : "Authenticated",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
      // optional: do NOT include token here if you want max security (cookie suffices)
    });
};
