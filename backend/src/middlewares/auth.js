import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "22110223";

export const verifyToken = (req, res, next) => {
    // 1. Lấy token từ header "Authorization"
    // Thường token sẽ có dạng: "Bearer <chuỗi_token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập! (Thiếu Token)" });
    }

    try {
        // 2. Giải mã token bằng JWT_SECRET trong .env
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Lưu thông tin user đã giải mã vào object request (req.user)
        // Các controller phía sau có thể lấy req.user.id để dùng
        req.user = decoded;
        
        next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

// Middleware phân quyền (Admin)
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: "Truy cập bị từ chối! Bạn không phải Admin." });
    }
};