    import express from 'express';
    import { 
        getBooks, 
        getBookById, 
        createBook, 
        updateBook, 
        deleteBook,
        createBookReview,
        getHomeProducts,
        getRelatedBooks,
        getCategories,
        getAllBooksAdmin
    } from '../controllers/bookController.js';
    import { verifyToken, isAdmin } from '../middlewares/auth.js';
    import { uploadBook } from '../config/cloudinary.js';

    const router = express.Router();

    // Error handling middleware for multer
    const handleUploadError = (err, req, res, next) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: "Lỗi upload file: " + err.message });
        }
        next();
    };

    // Public Routes (Ai cũng xem được)
    router.get('/public/home-data', getHomeProducts);
    router.get('/categories', getCategories);
    
    // Admin Routes (Cần đăng nhập & quyền Admin) - PHẢI KHAI BÁO TRƯỚC :id ROUTES
    router.get('/admin/all', verifyToken, isAdmin, getAllBooksAdmin);
    router.post('/', verifyToken, isAdmin, uploadBook.single('image'), handleUploadError, createBook);
    router.put('/:id', verifyToken, isAdmin, uploadBook.single('image'), handleUploadError, updateBook);
    router.delete('/:id', verifyToken, isAdmin, deleteBook);

    // User Routes - KHAI BÁO SAU :id ROUTES
    // URL gọi: /api/books?keyword=abc&category=Novel&sort=price_asc
    router.get('/', getBooks);
    router.get('/:id/related', getRelatedBooks);
    router.get('/:id', getBookById);

    // Chỉ cần đã đăng nhập là có thể gọi (nhưng controller sẽ check đã mua hàng chưa)
    router.post('/:id/reviews', verifyToken, createBookReview);

    export default router;