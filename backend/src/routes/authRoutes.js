import express from 'express';
import { verifyToken } from '../middlewares/auth.js'
const router = express.Router();

import { requestOtp, register, login, getProfile, forgotPassword, resetPassword, googleLogin } from '../controllers/authController.js';
import { registerValidator, loginValidator, resetPasswordValidator } from '../middlewares/validator.js';

router.post('/request-otp', requestOtp);
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
// Thêm route cho Google Login
router.post('/google-login', googleLogin);
// API lấy thông tin cá nhân (Chỉ dành cho người đã Login)
router.get('/profile', verifyToken, getProfile);

export default router;