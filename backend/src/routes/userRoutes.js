import express from 'express';
import {
    getProfile,
    updateProfile,
    updateAvatar,
    changePassword,
    getAllUsers,
    deleteUser,
    addToWishlist,
    removeFromWishlist,
    getMyWishlist
} from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import { uploadAvatar } from '../config/cloudinary.js';

const router = express.Router();

// User routes (Cần đăng nhập)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.put('/avatar', verifyToken, uploadAvatar.single('avatar'), updateAvatar);
router.put('/change-password', verifyToken, changePassword);

// Wishlist routes
router.get('/wishlist/my', verifyToken, getMyWishlist);
router.post('/wishlist/add', verifyToken, addToWishlist);
router.delete('/wishlist/:id', verifyToken, removeFromWishlist);

// Admin routes
router.get('/all', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

export default router;
