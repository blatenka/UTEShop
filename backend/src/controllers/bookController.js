import Book from '../models/Book.js';
import Order from '../models/Order.js';
import User from '../models/User.js'

// 1. Lấy danh sách tất cả sách (Public)
// Có hỗ trợ tìm kiếm theo từ khóa ?keyword=...
export const getBooks = async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                title: {
                    $regex: req.query.keyword,
                    $options: 'i', // Không phân biệt hoa thường
                },
            }
            : {};

        const books = await Book.find({ ...keyword });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách sách" });
    }
};

// 2. Lấy chi tiết 1 cuốn sách theo ID (Public)
export const getBookById = async (req, res) => {
    try {
        // Validate MongoDB ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID sách không hợp lệ" });
        }
        
        const book = await Book.findById(req.params.id);
        if (book) {
            // Tăng view mỗi khi xem chi tiết
            book.views = book.views + 1;
            await book.save();
            
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: "Không tìm thấy sách" });
        }
    } catch (error) {
            res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

// 3. Tạo sách mới (Admin Only)
export const createBook = async (req, res) => {
    try {
        const { title, author, image, description, category, price, originalPrice, countInStock } = req.body;

        const book = new Book({
            user: req.user.id, // Lấy ID từ middleware verifyToken
            title,
            author,
            image, // Link ảnh
            description,
            category,
            price,
            originalPrice,
            countInStock
        });

        const createdBook = await book.save();
        res.status(201).json(createdBook);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo sách: " + error.message });
    }
};

// 4. Cập nhật sách (Admin Only)
export const updateBook = async (req, res) => {
    try {
        const { title, author, description, image, category, price, originalPrice, countInStock } = req.body;

        const book = await Book.findById(req.params.id);

        if (book) {
            book.title = title || book.title;
            book.author = author || book.author;
            book.description = description || book.description;
            book.image = image || book.image;
            book.category = category || book.category;
            book.price = price || book.price;
            book.originalPrice = originalPrice || book.originalPrice;
            book.countInStock = countInStock || book.countInStock;

            const updatedBook = await book.save();
            res.status(200).json(updatedBook);
        } else {
            res.status(404).json({ message: "Không tìm thấy sách" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật sách" });
    }
};

// 5. Xóa sách (Admin Only)
export const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (book) {
            await book.deleteOne();
            res.status(200).json({ message: "Đã xóa sách thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy sách" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa sách" });
    }
};

export const createBookReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const bookId = req.params.id;

        const book = await Book.findById(bookId);
        if (!book) return res.status(404).json({ message: "Sách không tồn tại" });

        // Tìm thông tin đầy đủ của User để lấy trường 'name'
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

        // Kiểm tra đã mua hàng chưa (Giữ nguyên logic cũ của bạn)
        const hasBought = await Order.findOne({
            user: req.user.id,
            status: 5,
            "orderItems.product": bookId
        });

        if (!hasBought) {
            return res.status(400).json({ message: "Bạn cần mua và nhận hàng thành công mới được đánh giá." });
        }

        const alreadyReviewed = book.reviews.find(
            (r) => r.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
        }

        // TẠO ĐỐI TƯỢNG REVIEW VỚI TÊN LẤY TỪ DB
        const review = {
            name: user.name, // Lấy tên từ object user vừa tìm được
            rating: Number(rating),
            comment,
            user: req.user.id,
        };

        book.reviews.push(review);
        book.numReviews = book.reviews.length;
        book.rating = book.reviews.reduce((acc, item) => item.rating + acc, 0) / book.reviews.length;

        await book.save();
        res.status(201).json({ message: "Đã thêm đánh giá thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống khi đánh giá: " + error.message });
    }
};