import jwt from "jsonwebtoken";
//helper function
export function SignToken(user){
    return  jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
}