import express from "express"
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/db.js";
import cors from "cors";


import jobRoutes from "./routing/job.routes.js"
import cookieParser from "cookie-parser";

const app = express()

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://job-frontend-snowy.vercel.app",
  "https://job-frontend-snowy.vercel.app/", // with trailing slash
  "https://job-frontend-snowy.vercel.app/*" // wildcard for subpaths
];

// Enhanced CORS configuration for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check if origin matches any pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200
}));

// handle preflight requests (optional but useful)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Routes
app.use("/api/v1", jobRoutes);

const PORT = process.env.PORT || 5000;

// Log environment info for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('CORS Origins:', allowedOrigins);
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT Secret:', process.env.SECRET ? 'Set' : 'Not set');

app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`)
    connectDB()
})


