import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth.js'
import { requestOtp, register, login, getProfile, forgotPassword, resetPassword, googleLogin, getAllUsers, deleteUser } from '../controllers/authController.js';
import { registerValidator, loginValidator, resetPasswordValidator} from '../middlewares/validator.js';
const router = express.Router();



router.post('/request-otp', requestOtp);
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);
// Thêm route cho Google Login
router.post('/google-login', googleLogin);
// API lấy thông tin cá nhân (Chỉ dành cho người đã Login)
router.get('/profile', verifyToken, getProfile);
router.get('/users', verifyToken, isAdmin, getAllUsers);
router.delete('/users/:id', verifyToken, isAdmin, deleteUser);

export default router;