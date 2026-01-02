# 🚀 Quick Start Guide - Redux + Axios UTEShop

## ⚡ 30-Second Setup

```bash
# 1. Frontend - Install & Run
cd frontend
npm install
npm run dev

# 2. Backend - In new terminal
cd backend  
npm run dev

# 3. Open Browser
http://localhost:5173
```

---

## 📦 What Was Changed

### Dependencies Added (5)
```json
{
  "axios": "^1.13.2",
  "@reduxjs/toolkit": "^2.11.1",
  "react-redux": "^9.2.0",
  "redux": "^5.0.1",
  "redux-persist": "^6.0.0"
}
```

### New Folders (1)
```
frontend/src/redux/
├── api.js              ← Axios config + interceptors
├── store.js            ← Redux store + persistence
└── slices/authSlice.js ← State machine (7 thunks + 3 reducers)
```

### Updated Files (7)
- App.jsx (Redux hooks)
- main.jsx (Provider + Persist)
- Home.jsx (Redux state)
- Register.jsx (Redux dispatch)
- Login.jsx (Redux dispatch)
- ForgotPassword.jsx (Redux dispatch)
- Profile.jsx (Redux state)

---

## 🔥 Key Features

### Before
```javascript
// Fetch API - Manual everywhere
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

### After
```javascript
// Redux + Axios - One line dispatch
dispatch(login(data)).then(result => navigate('/profile'));
```

---

## 📊 Redux State

```javascript
// Access state
const { user, token, isLoggedIn, loading, error } = 
  useSelector((state) => state.auth);

// Result:
{
  user: { name, email, username, picture, isVerified, createdAt },
  token: "eyJhbGci...",
  isLoggedIn: true,
  loading: false,
  error: null
}
```

---

## 🎮 Available Actions

### Auth Actions (Dispatch These)
```javascript
dispatch(requestOtp(email))
dispatch(register({ email, otp, password, name, username }))
dispatch(login({ email, password }))
dispatch(googleLogin({ googleId, email, name, picture }))
dispatch(getProfile())
dispatch(forgotPassword(email))
dispatch(resetPassword({ email, otp, newPassword }))

dispatch(logout())  // Manual logout
```

---

## ✅ Test These Flows

### 1. Register
```
/register → Fill form → Request OTP
→ Check console for OTP (dev mode)
→ Enter OTP → Complete Registration
→ Auto redirect to /login ✅
```

### 2. Login
```
/login → Enter credentials
→ Redux loading state shows "Signing in..."
→ Token saved to localStorage
→ Auto redirect to /profile ✅
→ User data displayed
```

### 3. Stay Logged In
```
Logged in → Refresh page (F5)
→ Should still be logged in ✅
→ No login prompt
→ User data still there
```

### 4. Logout
```
/profile → Click Logout
→ Redux state cleared
→ localStorage cleared
→ Redirect to home ✅
```

### 5. Password Reset
```
/forgot-password → Email → OTP → New Password
→ Success message
→ Redirect to /login ✅
```

---

## 🔧 Axios Auto Features

### 1. Auto Token Injection
Every request automatically includes:
```
Authorization: Bearer <your-jwt-token>
```

### 2. Auto 401 Handling
When token expires:
- Clears localStorage
- Clears Redux state  
- Redirects to /login ✅

### 3. Consistent Base URL
All requests go to: `http://localhost:5000/api/auth`

---

## 📝 Example: Build a New Feature with Redux

### Step 1: Create Thunk
```javascript
// In authSlice.js
export const myAction = createAsyncThunk(
  'auth/myAction',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/endpoint', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
```

### Step 2: Handle Cases
```javascript
// In extraReducers
.addCase(myAction.pending, (state) => {
  state.loading = true;
})
.addCase(myAction.fulfilled, (state, action) => {
  state.loading = false;
  state.success = action.payload.message;
})
.addCase(myAction.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload;
});
```

### Step 3: Use in Component
```javascript
const { loading, error, success } = useSelector(s => s.auth);
const dispatch = useDispatch();

const handle = () => {
  dispatch(myAction(data)).then(result => {
    if (result.type === myAction.fulfilled.type) {
      // Success!
    }
  });
};
```

---

## 🐛 Debug Quick Tips

### See Redux State
```javascript
// In console, any page
localStorage.getItem('persist:root')
```

### Check Token
```javascript
localStorage.getItem('token')
localStorage.getItem('user')
```

### Watch Network Requests
Browser DevTools → Network tab → See Authorization header

### Watch Redux Actions
Install Redux DevTools extension → See all dispatched actions

---

## ⚠️ Common Mistakes

### ❌ Wrong
```javascript
import { useDispatch } from 'redux';  // ❌
const user = state.user;  // ❌ Use useSelector instead
```

### ✅ Right
```javascript
import { useDispatch, useSelector } from 'react-redux';
const user = useSelector(state => state.auth.user);
```

---

## 📚 Documentation

Read these for detailed info:
1. `REDUX_AXIOS_SETUP.md` - Technical deep dive
2. `REDUX_MIGRATION_SUMMARY.md` - Before/after comparison
3. `INTEGRATION_CHECKLIST.md` - All changes listed
4. `README_REDUX.md` - Full overview

---

## ✨ Project Structure (After Migration)

```
frontend/src/
├── redux/                    ✨ NEW
│   ├── api.js
│   ├── store.js
│   └── slices/authSlice.js
├── pages/
│   ├── Home.jsx              ✏️ UPDATED
│   ├── Register.jsx          ✏️ UPDATED
│   ├── Login.jsx             ✏️ UPDATED
│   ├── ForgotPassword.jsx    ✏️ UPDATED
│   └── Profile.jsx           ✏️ UPDATED
├── styles/
├── App.jsx                   ✏️ UPDATED
├── main.jsx                  ✏️ UPDATED
└── ...rest unchanged
```

---

## 🎯 What's Working Now

| Feature | Status |
|---------|--------|
| Register with OTP | ✅ |
| Login with JWT | ✅ |
| Auto-login on refresh | ✅ |
| Token auto-injection | ✅ |
| 401 auto-redirect | ✅ |
| Password reset | ✅ |
| Protected routes | ✅ |
| State persistence | ✅ |
| Error handling | ✅ |
| Loading states | ✅ |
| Google OAuth (UI ready) | ⏳ |

---

## 🚀 Next Enhancements

```javascript
// Create new slices easily:
// redux/slices/productSlice.js
// redux/slices/cartSlice.js
// redux/slices/orderSlice.js
```

---

## 💡 Pro Tips

### Tip 1: Redux DevTools
Install "Redux DevTools" extension to inspect every action and state change

### Tip 2: Check Persistence
```javascript
// In any component
useEffect(() => {
  console.log(localStorage.getItem('persist:root'));
}, []);
```

### Tip 3: Axios Debugging
All API calls now automatically log token in headers

### Tip 4: Error Inspection
```javascript
const { error, loading } = useSelector(state => state.auth);
// Use these to debug failed requests
```

---

## ⏱️ Time to Complete

| Task | Time |
|------|------|
| Install dependencies | 1 min |
| Start backend | 30 sec |
| Start frontend | 30 sec |
| Test register | 2 min |
| Test login | 1 min |
| Test persistence | 30 sec |
| **Total** | **~5 min** |

---

## 🎉 You're Ready!

Everything is set up. Just:
1. Run `npm install` (once)
2. Run backends and frontend
3. Test the flows
4. Start building new features

---

## 📞 Quick Reference

```javascript
// Import Redux hooks
import { useDispatch, useSelector } from 'react-redux';

// Get state
const { user, token, isLoggedIn, loading, error } = 
  useSelector(s => s.auth);

// Dispatch action
const dispatch = useDispatch();
dispatch(login({ email, password }));

// Import actions
import { 
  requestOtp, register, login, googleLogin,
  getProfile, forgotPassword, resetPassword,
  logout, clearError, clearSuccess 
} from '../redux/slices/authSlice';

// Import API
import apiClient from '../redux/api';
```

---

**Status**: ✅ Ready for Use
**Last Updated**: Dec 8, 2025
**Build Status**: ✅ Passing
