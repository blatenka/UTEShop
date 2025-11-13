# Ứng dụng Đăng nhập với JWT (React + Redux + Axios)

Dự án này là một ứng dụng đăng nhập sử dụng JWT token, được xây dựng bằng React. Ứng dụng sử dụng Axios để gọi API, lưu token vào Redux và localStorage, và bảo vệ route dashboard bằng React Router.

Cách hoạt động
- `src/components/Login.jsx` — Form đăng nhập sử dụng Redux hooks
- `src/features/authSlice.js` — Redux slice chứa `login` thunk để gọi API `/api/auth/login` và lưu token
- `src/api/axios.js` — Instance Axios tự động gắn header `Authorization: Bearer <token>`

Cách chạy ứng dụng
1. Cài đặt thư viện (PowerShell):

```powershell
cd "d:\Bai_tren_trg\Cac_cong_nghe_phan_mem_moi\nhom 2"
npm install
npm run dev
```

2. Cung cấp backend API. Ứng dụng cần API POST /api/auth/login với body JSON { email, password } và response { token, user }.

Ví dụ tạo nhanh server giả bằng json-server:

```js
// server.js
const jsonServer = require('json-server')
const server = jsonServer.create()
const middlewares = jsonServer.defaults()
server.use(jsonServer.bodyParser)
server.use(middlewares)

server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  // chấp nhận mọi thông tin đăng nhập trong demo này
  if (email && password) {
    return res.json({ token: 'mock-jwt-token', user: { name: 'Demo User', email } })
  }
  return res.status(400).json({ message: 'Thiếu thông tin đăng nhập' })
})

server.listen(3001, () => console.log('Server chạy tại http://localhost:5173/'))
```

Chạy server giả:

```powershell
npm install -g json-server
node server.js
```

Sau đó cấu hình proxy để Vite chuyển tiếp `/api` tới server giả, hoặc sửa `baseURL` trong `src/api/axios.js`.

Lưu ý
- Đây là demo cơ bản. Khi triển khai thực tế, cần bảo mật token và sử dụng refresh token.


/src
  /components
    - Login.jsx         // Form đăng nhập
    - Register.jsx      // Form đăng ký
    - Dashboard.jsx     // Trang sau khi đăng nhập
  /features
    - authSlice.js      // Redux slice xử lý auth
  /api
    - axios.js          // Cấu hình Axios gọi API
  - App.jsx             // Routes và logic chính
  - main.jsx           // Entry point

/server
  /routes
    - auth.js          // API đăng nhập/đăng ký
  /models
    - User.js          // MongoDB model
  - server.js          // Express server


