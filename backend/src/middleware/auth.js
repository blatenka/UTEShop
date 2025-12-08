import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "22110223";

/**
 * Middleware để verify JWT token
 * Sử dụng: router.get("/profile", verifyToken, getProfile)
 */
export const verifyToken = (req, res, next) => {
  try {
    // Lấy token từ Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header required" });
    }

    // Format: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Lưu userId vào request
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.username = decoded.username;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(401).json({ message: "Unauthorized" });
  }
};
