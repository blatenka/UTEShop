import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"

// 1. Cấu hình dotenv ngay đầu file
dotenv.config();

const app = express();

// 2. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// 3. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);

// 4. Kết nối MongoDB với các tùy chọn xử lý lỗi tốt hơn
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ute_bookshop";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    
    // 5. Chỉ chạy server khi DB đã kết nối thành công
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Dừng app nếu không kết nối được DB
  });