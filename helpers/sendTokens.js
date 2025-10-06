import { SignToken } from "../utils/jwt.js";

export const sendToken = (res, user, statusCode = 200) => {
  const token = SignToken(user);

  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax", // changed from 'strict' to 'lax' for better compatibility
    secure: process.env.NODE_ENV === "production",
    maxAge: 1 * 60 * 60 * 1000, // 1 hour (ms)
    path: "/",
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
