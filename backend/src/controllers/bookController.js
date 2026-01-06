import Book from '../models/Book.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// 1. Lấy danh sách tất cả sách (Public)
//Lấy danh sách, Search Fuzzy, Lọc & Phân trang
export const getBooks = async (req, res) => {
    try {
        // Lấy các tham số từ URL
        const { keyword, category, minPrice, maxPrice, sort, pageNumber } = req.query;

        // Xây dựng Query tìm kiếm
        let query = {};

        // a. Search Fuzzy (Tìm gần đúng theo Tên hoặc Tác giả)
        if (keyword) {
            const regex = new RegExp(keyword, 'i'); // 'i' là không phân biệt hoa thường
            query.$or = [
                { title: { $regex: regex } },
                { author: { $regex: regex } }
            ];
        }

        // b. Lọc theo Danh mục
        if (category) {
            query.category = category;
        }

        // c. Lọc theo Giá
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice); // Lớn hơn hoặc bằng
            if (maxPrice) query.price.$lte = Number(maxPrice); // Nhỏ hơn hoặc bằng
        }

        // d. Sắp xếp
        let sortOption = { createdAt: -1, _id: -1 }; // Mặc định: mới nhất

        if (sort === 'price_asc') sortOption = { price: 1, _id: 1 };
        if (sort === 'price_desc') sortOption = { price: -1, _id: -1 };
        if (sort === 'top_rated') sortOption = { rating: -1, _id: -1 };
        if (sort === 'best_selling') sortOption = { sold: -1, _id: -1 };

        // e. Phân trang (Pagination)
        const pageSize = 12; // Số sách mỗi trang
        const page = Number(pageNumber) || 1;

        const count = await Book.countDocuments(query); // Tổng số kết quả tìm được
        const books = await Book.find(query)
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.status(200).json({
            books,
            page,
            pages: Math.ceil(count / pageSize),
            totalBooks: count
        });

    } catch (error) {
        res.status(500).json({ message: "Lỗi tìm kiếm sách" });
    }
};
// 2. Lấy chi tiết 1 cuốn sách theo ID (Public)
export const getBookById = async (req, res) => {
    try {
        // Validate MongoDB ID format
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID sách không hợp lệ" });
        }

        const book = await Book.findById(req.params.id).populate('reviews.user', 'avatar name email');
        if (book) {
            // Tăng view mỗi khi xem chi tiết
            book.views = book.views + 1;
            await book.save();

            // Đảm bảo author không rỗng
            if (!book.author) {
                book.author = "Tác giả không xác định";
            }

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
        const { title, author, description, category, price, originalPrice, countInStock } = req.body;

        // Kiểm tra yêu cầu tối thiểu
        if (!title || !author || !category || !price || !countInStock) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ các trường bắt buộc" });
        }

        // Kiểm tra file trước
        if (!req.file) {
            console.log("=== FILE MISSING ===");
            console.log("Body:", req.body);
            console.log("Headers:", req.headers['content-type']);
            return res.status(400).json({ message: "Vui lòng chọn ảnh sách (không nhận được file)" });
        }

        // Lấy URL từ Cloudinary (upload via middleware)
        const imageUrl = req.file.path;
        
        console.log("=== CREATE BOOK SUCCESS ===");
        console.log("Title:", title);
        console.log("File name:", req.file.filename);
        console.log("Image URL:", imageUrl);

        const book = new Book({
            user: req.user.id,
            title,
            author,
            image: imageUrl, // URL từ Cloudinary
            description: description || "",
            category,
            price: Number(price),
            originalPrice: Number(originalPrice),
            countInStock: Number(countInStock)
        });

        const createdBook = await book.save();
        res.status(201).json(createdBook);
    } catch (error) {
        console.error("=== ERROR CREATING BOOK ===");
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        res.status(500).json({ 
            message: "Lỗi khi tạo sách: " + (error.message || "Lỗi không xác định")
        });
    }
};

// 4. Cập nhật sách (Admin Only)
export const updateBook = async (req, res) => {
    try {
        const { title, author, description, category, price, originalPrice, countInStock } = req.body;

        const book = await Book.findById(req.params.id);

        if (book) {
            book.title = title || book.title;
            book.author = author || book.author;
            book.description = description || book.description;
            
            // Nếu có file upload mới, sử dụng URL từ Cloudinary; nếu không giữ ảnh cũ
            if (req.file) {
                book.image = req.file.path;
            }
            
            book.category = category || book.category;
            book.price = price ? Number(price) : book.price;
            book.originalPrice = originalPrice ? Number(originalPrice) : book.originalPrice;
            book.countInStock = countInStock !== undefined ? Number(countInStock) : book.countInStock;

            const updatedBook = await book.save();
            res.status(200).json(updatedBook);
        } else {
            res.status(404).json({ message: "Không tìm thấy sách" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật sách: " + error.message });
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

export const getHomeProducts = async (req, res) => {
    try {
        // Sử dụng Promise.all để chạy 4 câu lệnh tìm kiếm song song (Tối ưu tốc độ)
        const [newArrivals, bestSellers, topViewed, hotDeals] = await Promise.all([
            // a. 08 Sản phẩm mới nhất
            Book.find().select('title author price originalPrice image slug category rating numReviews countInStock').sort({ updatedAt: -1, _id: -1 }).limit(8),

            // b. 06 Sản phẩm bán chạy nhất (Dựa trên trường 'sold' đã update khi đặt hàng)
            Book.find().select('title author price originalPrice image slug category rating numReviews sold countInStock').sort({ sold: -1 }).limit(6),

            // c. 08 Sản phẩm xem nhiều nhất (Dựa trên trường 'views')
            Book.find().select('title author price originalPrice image slug category rating numReviews views countInStock').sort({ views: -1 }).limit(8),

            // d. 04 Sản phẩm khuyến mãi cao nhất (Tính % giảm giá)
            Book.aggregate([
                {
                    $addFields: {
                        // Tính % giảm: (Gốc - Bán) / Gốc * 100
                        discountPercent: {
                            $cond: [
                                { $gt: ["$originalPrice", 0] }, // Nếu giá gốc > 0 mới tính
                                { $multiply: [{ $divide: [{ $subtract: ["$originalPrice", "$price"] }, "$originalPrice"] }, 100] },
                                0
                            ]
                        }
                    }
                },
                { $sort: { discountPercent: -1 } }, // Sắp xếp giảm dần theo %
                { $match: { discountPercent: { $gt: 0 } } }, // Chỉ lấy cái nào có giảm giá
                { $limit: 4 },
                { $project: { title: 1, author: 1, price: 1, originalPrice: 1, image: 1, discountPercent: 1, rating: 1, countInStock: 1 } } // Thêm countInStock vào trường cần thiết
            ])
        ]);

        res.status(200).json({
            newArrivals,
            bestSellers,
            topViewed,
            hotDeals
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu trang chủ: " + error.message });
    }
};

export const getRelatedBooks = async (req, res) => {
    try {
        const { id } = req.params; // ID của cuốn sách đang xem
        const currentBook = await Book.findById(id);

        if (!currentBook) {
            return res.status(404).json({ message: "Sách không tồn tại" });
        }

        // Logic: Cùng category nhưng KHÁC id hiện tại
        const relatedBooks = await Book.find({
            category: currentBook.category,
            _id: { $ne: id } // $ne = Not Equal (Loại trừ chính nó)
        })
            .limit(4) // Lấy 4 cuốn
            .select('title author price originalPrice image rating numReviews countInStock');

        res.status(200).json(relatedBooks);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy sản phẩm liên quan" });
    }
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Book.distinct('category');

        // Filter out empty or null categories
        const filteredCategories = categories.filter(cat => cat && cat.trim() !== '');

        res.status(200).json({
            categories: filteredCategories.sort() // Sort alphabetically
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh mục sách: " + error.message });
    }
};

export const getAllBooksAdmin = async (req, res) => {
    try {
        const books = await Book.find({}).sort({ createdAt: -1 });
        res.status(200).json({ books });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi lấy tất cả sách (Admin): " + error.message });
    }
}