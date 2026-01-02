# Redux + Axios Integration Guide

## Overview

UTEShop frontend đã được cập nhật để sử dụng **Redux Toolkit** cho state management và **Axios** cho HTTP requests, thay thế hoàn toàn cho Fetch API và useState.

## Cấu trúc Thư mục Redux

```
frontend/src/
├── redux/
│   ├── api.js                 # Axios instance với interceptors
│   ├── store.js               # Redux store config + persistor
│   └── slices/
│       └── authSlice.js       # Auth state + async thunks
├── pages/
│   ├── Home.jsx              # ✅ Updated with Redux
│   ├── Register.jsx          # ✅ Updated with Redux
│   ├── Login.jsx             # ✅ Updated with Redux
│   ├── ForgotPassword.jsx    # ✅ Updated with Redux
│   └── Profile.jsx           # ✅ Updated with Redux
├── App.jsx                    # ✅ Updated with Redux
├── main.jsx                   # ✅ Redux Provider + Persister
└── ...
```

## 1. Axios Configuration (`redux/api.js`)

### Tính năng:

- **Base URL**: `http://localhost:5000/api/auth`
- **Request Interceptor**: Tự động thêm JWT token vào headers
  ```
  Authorization: Bearer <token>
  ```
- **Response Interceptor**: Xử lý lỗi 401 (token hết hạn)
  - Xóa token khỏi localStorage
  - Redirect về `/login`

### Ví dụ:

```javascript
import apiClient from './redux/api';

// Sử dụng trong async thunk:
const response = await apiClient.post('/request-otp', { email });
```

## 2. Redux Store Structure

### Store Configuration (`redux/store.js`)

- **Redux Toolkit**: Sử dụng `configureStore()` thay vì `createStore()`
- **Redux Persist**: Lưu auth state vào localStorage tự động
- **Middleware**: Custom config để handle serialization errors từ persist

### Setup trong `main.jsx`:

```javascript
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';

<Provider store={store}>
  <PersistGate loading={null} persistor={persistor}>
    <App />
  </PersistGate>
</Provider>
```

## 3. Auth Slice (`redux/slices/authSlice.js`)

### State Structure:

```javascript
{
  auth: {
    user: { name, email, username, picture, isVerified, createdAt },
    token: "jwt_token_here",
    isLoggedIn: boolean,
    loading: boolean,
    error: null | "error message",
    success: null | "success message"
  }
}
```

### Async Thunks (Actions):

| Thunk | Purpose | Payload |
|-------|---------|---------|
| `requestOtp(email)` | Gửi OTP để đăng ký/reset mật khẩu | `{ email }` |
| `register(userData)` | Đăng ký account | `{ email, otp, password, name, username }` |
| `login({ email, password })` | Đăng nhập | `{ email, password }` |
| `googleLogin(googleData)` | Đăng nhập Google | `{ googleId, email, name, picture }` |
| `getProfile()` | Lấy profile người dùng | (không cần payload) |
| `forgotPassword(email)` | Yêu cầu reset mật khẩu | `{ email }` |
| `resetPassword({ email, otp, newPassword })` | Reset mật khẩu | payload object |

### Reducers (Actions đồng bộ):

| Reducer | Purpose |
|---------|---------|
| `logout()` | Xóa user, token, đặt isLoggedIn = false |
| `clearError()` | Xóa error message |
| `clearSuccess()` | Xóa success message |

## 4. Component Integration

### Cách sử dụng Redux Hooks:

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, clearError } from '../redux/slices/authSlice';

function LoginComponent() {
  const dispatch = useDispatch();
  const { loading, error, isLoggedIn } = useSelector((state) => state.auth);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Dispatch thunk action
    dispatch(login({ email, password })).then((result) => {
      if (result.type === login.fulfilled.type) {
        navigate('/profile');
      }
    });
  };
}
```

### Pattern cho tất cả pages:

1. **Register.jsx & ForgotPassword.jsx**: Dispatch `requestOtp()` → `register()/resetPassword()`
2. **Login.jsx**: Dispatch `login()` → Auto redirect on success
3. **Profile.jsx**: Hiển thị `user` từ Redux state
4. **Home.jsx**: Check `isLoggedIn` từ Redux state

## 5. Data Persistence

### Redux Persist Configuration:

- **Key**: `'root'`
- **Storage**: Browser's localStorage
- **Whitelist**: Chỉ persist `auth` reducer
- **Rehydration**: Tự động load state từ localStorage on app start

### Flow:

```
App Start
    ↓
PersistGate
    ↓
Load from localStorage (instant)
    ↓
Render <App />
    ↓
useEffect: dispatch(getProfile()) if token exists
    ↓
Fetch fresh user data từ backend
```

## 6. API Integration (Axios vs Fetch)

### Before (Fetch):

```javascript
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
const data = await response.json();
```

### After (Axios + Redux):

```javascript
dispatch(login(formData)).then((result) => {
  if (result.type === login.fulfilled.type) {
    // Success - token auto-saved to localStorage
  }
});
```

## 7. Error Handling

### Redux State Errors:

```javascript
const { error, loading } = useSelector((state) => state.auth);

// Display in component:
{error && <div className="error-message">{error}</div>}
```

### Axios Interceptor (Response Errors):

```javascript
// In redux/api.js:
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - auto logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 8. Running the Application

### Start Backend:

```bash
cd backend
npm run dev
```

### Start Frontend:

```bash
cd frontend
npm install  # Nếu chưa install dependencies
npm run dev
```

## 9. Testing Flows

### Register Flow:

1. Go to `/register`
2. Enter email → Click "Request OTP"
3. Check console for OTP (dev mode)
4. Enter OTP → Click "Complete Registration"
5. Success → Redirect to `/login`

### Login Flow:

1. Go to `/login`
2. Enter credentials → Click "Sign In"
3. Success → Token saved to localStorage
4. Auto redirect to `/profile`

### Password Reset Flow:

1. Go to `/forgot-password`
2. Enter email → Click "Request OTP"
3. Enter OTP → Click "Verify OTP"
4. Enter new password → Click "Reset Password"
5. Success → Redirect to `/login`

### Auto-Login:

1. Login and get token
2. Refresh page
3. App should auto-fetch profile without asking login again
4. Token persists in localStorage

## 10. Benefits of This Setup

✅ **State Management**: Centralized state in Redux
✅ **API Calls**: Consistent Axios configuration
✅ **Token Management**: Auto-inject JWT in requests
✅ **Data Persistence**: State survives page refresh
✅ **Error Handling**: Automatic 401 handling
✅ **Loading States**: Track pending requests
✅ **Clean Code**: Less boilerplate in components
✅ **Scalability**: Easy to add more slices/actions

## 11. Troubleshooting

### Q: Token không được lưu?
**A**: Kiểm tra Redux Persist whitelist config. Phải bao gồm 'auth'.

### Q: useSelector không update khi state thay đổi?
**A**: Đảm bảo đang sử dụng `useSelector` hook từ 'react-redux'.

### Q: API request không thêm Authorization header?
**A**: Kiểm tra Axios interceptor trong `redux/api.js` có `localStorage.getItem('token')`.

### Q: 401 error nhưng không redirect về login?
**A**: Kiểm tra response interceptor có `window.location.href = '/login'`.

## 12. Next Steps

- [ ] Google OAuth integration
- [ ] Edit profile endpoint
- [ ] Change password endpoint
- [ ] Real email sending (OTP)
- [ ] Rate limiting on OTP requests
- [ ] Refresh token rotation
- [ ] Product/Cart slices
