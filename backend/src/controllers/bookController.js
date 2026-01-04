import Book from '../models/Book.js';

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
            res.status(404).json({ message: "Sách không tồn tại" });
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