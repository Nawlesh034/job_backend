import jwt from "jsonwebtoken";
// import User from "../models/User.js"; // optional for tokenVersion checks

export const auth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    console.log("Auth middleware - token present:", !!token);
    if (!token) return res.status(401).json({ success:false, message: "No token, authorization denied" });

    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("Auth middleware - decoded token:", decoded);
    // optional: check tokenVersion in DB
    // const user = await User.findById(decoded.id);
    // if (!user || user.tokenVersion !== decoded.tokenVersion) return res.status(401).json({ message: 'Token revoked' });

    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    console.error("authMiddleware error", err);
    return res.status(403).json({ success:false, message: "Invalid or expired token" });
  }
};
