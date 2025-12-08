# UTE_BookShop

Dự án UTE_BookShop được xây dựng theo mô hình **MERN** gồm:
- Backend: Node.js + Express
- Frontend: React + Vite
- Database: MongoDB

## Cài đặt

### Backend
```bash
cd backend
npm install
```

Tạo file `.env`:
```
MONGO_URI=mongodb://localhost:27017/ute_bookshop
PORT=5000
```

Chạy backend:
```bash
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```

Tạo file `.env`:
```
VITE_API_URL=http://localhost:5000
```

Chạy frontend:
```bash
npm run dev
```

## Cấu trúc
```
UTE_BookShop/
├── backend/
└── frontend/
```

## Ghi chú
- Frontend: http://localhost:5173  
- Backend: http://localhost:5000
