import express from 'express';
import { 
    getBooks, 
    getBookById, 
    createBook, 
    updateBook, 
    deleteBook 
} from '../controllers/bookController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public Routes (Ai cũng xem được)
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin Routes (Cần đăng nhập & quyền Admin)
router.post('/', verifyToken, isAdmin, createBook);
router.put('/:id', verifyToken, isAdmin, updateBook);
router.delete('/:id', verifyToken, isAdmin, deleteBook);

export default router;