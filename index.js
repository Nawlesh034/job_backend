import express from "express"
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/db.js";
import cors from "cors";


import jobRoutes from "./routing/job.routes.js"
import cookieParser from "cookie-parser";

const app = express()

// Middleware
app.use(cors({
  origin:"http://localhost:5173",            // exact origin — NOT '*'
  credentials: true,             // allow cookies to be sent/received
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

// handle preflight requests (optional but useful)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use("/api/v1", jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`)
    connectDB()
})


