import express from 'express';
import { requestOtp, register, login, forgotPassword, resetPassword, googleLogin } from '../controllers/authController.js';
import { registerValidator, loginValidator, resetPasswordValidator } from '../middlewares/validator.js';

const router = express.Router();

router.post('/request-otp', requestOtp);
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/google-login', googleLogin);

export default router;