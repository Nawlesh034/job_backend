import express from "express";
import { 
  createJob,
  deleteJob,
  getAllJobs,
  getJobById,
  updateJob, 
  
} from "../controllers/job.controllers.js";
import {auth} from "../middlewares/auth.verify.js";
import { login, logout, register, me } from "../controllers/auth.controllers.js";

const router = express.Router();



router.post("/register",register)
router.post("/login",login)
router.post("/logout",logout)
router.get("/me", auth, me)


router.post("/createJob", auth,createJob);

router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJobById);
router.put("/jobs/:id", auth,updateJob);
router.delete("/jobs/:id",auth, deleteJob);

export default router;
