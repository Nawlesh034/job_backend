import { SignToken } from "../utils/jwt.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { sendToken } from "../helpers/sendTokens.js";

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log({name})

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password is required" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already existed" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role,
    });
    await newUser.save();

    // set auth cookie and return user via helper
    sendToken(res, newUser, 201);
    return;
  } catch (e) {
    console.log("registration error", e);
    return res.status(500).json({
      success:false,
      message:"Registration Failed due to the server error",
      error:e.message
    })
  }
};

export const login =async(req,res)=>{
    const {email,password} = req.body;
    console.log("Login attempt for email:", email);
    try{
       if(!email || !password){
        return res.status(400).json({message:"email or password is required"})
       }
       const user = await User.findOne({email})
       console.log("User found:", !!user, user?.role);
       if(!user){
        return res.status(400).json({message:"User not found"})
       }

       const isMatched = await bcrypt.compare(password,user.password)
       console.log("Password match:", isMatched);

       if(!isMatched){
        return res.status(400).json({message:"password is wrong"})
       }

       console.log("Login successful, sending token for user:", user._id, user.role);
       // set auth cookie and return user via helper
       sendToken(res, user, 200);
       return;


        
    }
    catch(e){
        
      console.log("error in login",e)
      return res.status(500).json({
        success:false,
        message:"Login failed due to the server error",
        error:e.message
      })
    }
}


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const me = (req, res) => {
  console.log("Me endpoint called, req.user:", req.user);
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
  const { id, email, role } = req.user;
  console.log("Returning user data:", { id, email, role });
  return res.status(200).json({ success: true, user: { id, email, role } });
};
