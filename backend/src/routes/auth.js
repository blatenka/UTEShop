import express from "express";
import {
  requestOtp,
  register,
  forgotPassword,
  resetPassword,
  login,
  googleLogin,
  getProfile,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Registration flow
router.post("/request-otp", requestOtp);
router.post("/register", register);

// Password reset flow
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Login
router.post("/login", login);

// Google Login
router.post("/google-login", googleLogin);

// Profile (Protected - require token)
router.get("/profile", verifyToken, getProfile);

export default router;
