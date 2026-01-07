# UTEShop - Nền Tảng Bán Sách Trực Tuyến

## 📋 Mô Tả Dự Án

**UTEShop** là một nền tảng thương mại điện tử hiện đại dành riêng để bán sách trực tuyến. Dự án được xây dựng theo mô hình **MERN Stack** (MongoDB, Express, React, Node.js), cung cấp trải nghiệm mua sắm liền mạch cho người dùng và giao diện quản lý hiệu quả cho quản trị viên.

### ✨ Các Tính Năng Chính

**Cho Người Dùng:**
- 📚 Duyệt và tìm kiếm danh sách sách
- 🛒 Giỏ hàng với quản lý sản phẩm
- 📑 Lịch sử đơn hàng
- ❤️ Danh sách yêu thích
- 👤 Quản lý hồ sơ người dùng
- 🔐 Xác thực an toàn với OTP
- 📧 Reset mật khẩu qua email

**Cho Quản Trị Viên:**
- 📊 Dashboard quản lý
- ➕ Thêm, sửa, xóa sách
- 📦 Quản lý đơn hàng
- 👥 Quản lý người dùng

## 🛠️ Công Nghệ Sử Dụng

| Phần | Công Nghệ |
|------|-----------|
| **Frontend** | React 18, Vite, Redux Toolkit, Axios |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose |
| **Authentication** | JWT, OTP via Email |
| **Upload File** | Cloudinary |
| **Email Service** | Nodemailer |

## ⚙️ Yêu Cầu Hệ Thống

Trước khi cài đặt, hãy đảm bảo máy của bạn có:

### Bắt Buộc
- **Node.js** v16 trở lên ([Download](https://nodejs.org/))
- **npm** v7 trở lên (đi kèm với Node.js)
- **MongoDB** v4.4 trở lên ([Hướng dẫn cài đặt](https://docs.mongodb.com/manual/installation/))
- **Git** ([Download](https://git-scm.com/))

### Tùy Chọn
- **MongoDB Compass** - GUI để quản lý MongoDB ([Download](https://www.mongodb.com/products/compass))
- **Postman** - Để test API ([Download](https://www.postman.com/downloads/))
- **VS Code** - Code Editor ([Download](https://code.visualstudio.com/))

## 🚀 Hướng Dẫn Cài Đặt và Chạy Ứng Dụng

### Bước 1: Tải Mã Nguồn

```bash
# Clone repository
git clone https://github.com/your-repo/UTEShop.git

# Truy cập thư mục dự án
cd UTEShop
```

### Bước 2: Cài Đặt Backend

```bash
# Truy cập thư mục backend
cd backend

# Cài đặt các dependencies
npm install
```

#### Tạo File `.env` cho Backend

Tạo file `backend/.env` và thêm các biến sau:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/ute_bookshop

# Server Port
PORT=5000

# JWT Secret (sinh ra một chuỗi bất kỳ)
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary (cho upload hình ảnh sách)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Gmail hoặc email khác)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

#### Chạy Backend

```bash
# Chạy server trong chế độ development (với hot reload)
npm run dev

# Hoặc chạy bình thường
npm start
```

Backend sẽ chạy tại: **http://localhost:5000**

### Bước 3: Cài Đặt Frontend

Mở terminal mới, truy cập thư mục frontend:

```bash
# Từ thư mục gốc UTEShop
cd frontend

# Cài đặt các dependencies
npm install
```

#### Tạo File `.env` cho Frontend

Tạo file `frontend/.env` và thêm:

```env
# API Server URL
VITE_API_URL=http://localhost:5000
```

#### Chạy Frontend

```bash
# Chạy development server
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:5173**

### Bước 4: Kiểm Tra Kết Nối

1. Mở trình duyệt và truy cập:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

2. Đảm bảo MongoDB đang chạy trên máy

3. Kiểm tra trong Console (F12) không có lỗi CORS

## 📝 Hướng Dẫn Sử Dụng Tài Khoản

### Đăng Ký Tài Khoản Mới
1. Nhấp vào "Đăng Ký"
2. Điền email, mật khẩu
3. Nhập OTP được gửi tới email
4. Hoàn thành đăng ký

### Đăng Nhập
1. Vào trang "Đăng Nhập"
2. Nhập email và mật khẩu
3. Nhấp "Đăng Nhập"

### Quên Mật Khẩu
1. Nhấp "Quên mật khẩu" trên trang đăng nhập
2. Nhập email đã đăng ký
3. Nhập OTP từ email
4. Tạo mật khẩu mới

## 📁 Cấu Trúc Thư Mục

```
UTEShop/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình (Cloudinary, DB)
│   │   ├── controllers/     # Logic xử lý request
│   │   ├── middlewares/     # Middleware (Auth, Validator)
│   │   ├── models/          # MongoDB Models
│   │   ├── routes/          # API Routes
│   │   ├── templates/       # Email Templates
│   │   ├── utils/           # Utility Functions
│   │   └── server.js        # Entry Point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api.js           # API Configuration
│   │   ├── App.jsx          # Root Component
│   │   ├── components/      # Reusable Components
│   │   ├── pages/           # Page Components
│   │   ├── redux/           # Redux Store & Slices
│   │   ├── styles/          # CSS Files
│   │   └── utils/           # Utility Functions
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md
```

## 🔧 Các Lệnh Hữu Ích

### Backend

```bash
# Cài đặt dependencies
npm install

# Chạy server development
npm run dev

# Chạy server production
npm start

# Kiểm tra lỗi lint
npm run lint
```

### Frontend

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview build production
npm run preview

# Kiểm tra lint
npm run lint
```

## ⚠️ Ghi Chú Quan Trọng

1. **MongoDB phải chạy** trước khi khởi động backend
2. **Port 5000 và 5173** phải khả dụng (không bị các ứng dụng khác chiếm dụng)
3. **Email Service**: Cần kích hoạt "App Password" nếu dùng Gmail
4. **Cloudinary**: Cần tạo tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com/)
5. Các file `.env` không được commit vào git (đã có trong `.gitignore`)

## 🐛 Gỡ Lỗi Thường Gặp

### Backend không kết nối MongoDB
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
✅ Giải pháp: Khởi động MongoDB service
```

### CORS Error trong Frontend
```
❌ Error: Access to XMLHttpRequest has been blocked by CORS policy
✅ Giải pháp: Kiểm tra VITE_API_URL trong .env frontend
```

### Port đã được sử dụng
```
❌ Error: listen EADDRINUSE :::5000
✅ Giải pháp: Thay đổi PORT trong .env hoặc dừng ứng dụng khác
```

### Email không gửi được
```
❌ Error: Invalid login or password
✅ Giải pháp: Kiểm tra EMAIL_USER, EMAIL_PASSWORD và bật "Less Secure App" (Gmail)
```

## 👥 Thông Tin Dự Án

- **Trường**: HCMUTE (Trường Đại học Sư phạm Kỹ thuật TP.HCM)
- **Khóa học**: Semester 7 - Công Nghệ Phần Mềm Mới
- **Loại dự án**: MERN Stack E-commerce Application

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra các yêu cầu hệ thống
2. Xem phần "Gỡ Lỗi Thường Gặp"
3. Kiểm tra logs trong terminal
4. Tạo Issue trên GitHub repository
