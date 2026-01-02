# Migration to Redux + Axios - Complete Summary

## What Changed?

### 1. Dependencies Added ✅

```json
{
  "@reduxjs/toolkit": "^2.11.1",
  "axios": "^1.13.2",
  "react-redux": "^9.2.0",
  "redux": "^5.0.1",
  "redux-persist": "^6.0.0"
}
```

**Installation**:
```bash
npm install axios redux react-redux @reduxjs/toolkit redux-persist
```

### 2. New Redux Structure ✅

```
frontend/src/redux/
├── api.js                    # Axios instance + interceptors
├── store.js                  # Redux store config + persistor
└── slices/
    └── authSlice.js          # Auth state + 7 async thunks
```

### 3. Updated Pages ✅

| Page | Previous | Now |
|------|----------|-----|
| `App.jsx` | useState + fetch | useSelector/useDispatch |
| `main.jsx` | No provider | Redux Provider + PersistGate |
| `Home.jsx` | Props from App | useSelector(auth state) |
| `Register.jsx` | useState + fetch | dispatch(requestOtp/register) |
| `Login.jsx` | useState + fetch | dispatch(login) |
| `ForgotPassword.jsx` | useState + fetch | dispatch(forgotPassword/resetPassword) |
| `Profile.jsx` | Props from App | useSelector(user) |

## Key Improvements

### Before (Fetch API):

```javascript
// App.jsx - Manual prop drilling
const [user, setUser] = useState(null);

const fetchProfile = async (token) => {
  const response = await fetch("http://localhost:5000/auth/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  setUser(data.user);
};

<Home user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
```

### After (Redux + Axios):

```javascript
// App.jsx - Centralized state
const { user, isLoggedIn } = useSelector((state) => state.auth);
dispatch(getProfile());

<Home onLogout={handleLogout} />  // No prop drilling!
```

### Before (Fetch in Component):

```javascript
// Register.jsx
const handleRequestOTP = async (e) => {
  setLoading(true);
  try {
    const response = await fetch("http://localhost:5000/auth/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    // ... handle response
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
};
```

### After (Redux Thunk):

```javascript
// Register.jsx
const dispatch = useDispatch();
const { loading, error } = useSelector((state) => state.auth);

const handleRequestOTP = async (e) => {
  e.preventDefault();
  dispatch(requestOtp(email)).then((result) => {
    if (result.type === requestOtp.fulfilled.type) {
      setStep(2);
    }
  });
};
```

## Redux Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    React Component                        │
│  (Register.jsx, Login.jsx, Profile.jsx, etc.)            │
└───────────────────┬──────────────────────────────────────┘
                    │
                    │ dispatch(requestOtp(email))
                    │ or login(data)
                    │ or getProfile()
                    ↓
┌──────────────────────────────────────────────────────────┐
│              Redux Slice (authSlice.js)                  │
│  - Action Creators (Async Thunks)                       │
│  - Reducers (State Updates)                             │
│  - State: user, token, loading, error, success          │
└───────────────────┬──────────────────────────────────────┘
                    │
                    │ axios.post('/login', credentials)
                    ↓
┌──────────────────────────────────────────────────────────┐
│         Axios Instance (redux/api.js)                   │
│  - Request Interceptor: Add JWT token to headers        │
│  - Response Interceptor: Handle 401, redirect to /login │
│  - Base URL: http://localhost:5000/api/auth             │
└───────────────────┬──────────────────────────────────────┘
                    │
                    │ HTTP Request
                    ↓
┌──────────────────────────────────────────────────────────┐
│            Backend API (Node.js/Express)                │
│  POST /login, /register, /request-otp, etc.             │
└──────────────────────────────────────────────────────────┘
```

## Async Thunks Explained

### Thunk Lifecycle:

Each async thunk goes through 3 states:

1. **Pending**: Request is in-flight
   ```javascript
   builder.addCase(login.pending, (state) => {
     state.loading = true;
     state.error = null;
   });
   ```

2. **Fulfilled**: Request succeeded
   ```javascript
   builder.addCase(login.fulfilled, (state, action) => {
     state.loading = false;
     state.token = action.payload.token;
     state.isLoggedIn = true;
   });
   ```

3. **Rejected**: Request failed
   ```javascript
   builder.addCase(login.rejected, (state, action) => {
     state.loading = false;
     state.error = action.payload;
   });
   ```

## Redux Persist

### How It Works:

1. **On Save**: When Redux state changes, it's automatically saved to `localStorage`
2. **On Load**: When app starts, Redux Persist loads saved state from localStorage
3. **Rehydration**: State is "rehydrated" (restored) into Redux store

### Configuration:

```javascript
// redux/store.js
const persistConfig = {
  key: 'root',              // Key in localStorage
  storage,                  // Use localStorage
  whitelist: ['auth'],      // Only persist 'auth' reducer
};
```

### Result:

✅ Page refresh = No logout needed
✅ Token persists across browser tabs
✅ User data available instantly on startup

## Axios Interceptors

### Request Interceptor:

Automatically adds JWT token to every request:

```javascript
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Response Interceptor:

Handles unauthorized (401) errors automatically:

```javascript
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
```

## Usage Examples

### Example 1: Register with Redux

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { requestOtp, register } from '../redux/slices/authSlice';

function RegisterComponent() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);

  // Step 1: Request OTP
  const handleRequestOTP = (email) => {
    dispatch(requestOtp(email)).then((result) => {
      if (result.type === requestOtp.fulfilled.type) {
        setStep(2);
      }
    });
  };

  // Step 2: Register
  const handleRegister = (userData) => {
    dispatch(register(userData)).then((result) => {
      if (result.type === register.fulfilled.type) {
        navigate('/login');
      }
    });
  };

  return (
    <>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}
      {/* Form JSX */}
    </>
  );
}
```

### Example 2: Access User Data

```javascript
import { useSelector } from 'react-redux';

function ProfileComponent() {
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Example 3: Auto-Login on App Start

```javascript
function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(getProfile());  // Fetch fresh user data
    }
  }, [dispatch, user]);

  // Rest of component
}
```

## File Structure After Migration

```
frontend/src/
├── redux/
│   ├── api.js                    ✅ NEW: Axios config
│   ├── store.js                  ✅ NEW: Redux store
│   └── slices/
│       └── authSlice.js          ✅ NEW: Auth state
├── pages/
│   ├── Home.jsx                  ✅ UPDATED: Redux
│   ├── Register.jsx              ✅ UPDATED: Redux
│   ├── Login.jsx                 ✅ UPDATED: Redux
│   ├── ForgotPassword.jsx        ✅ UPDATED: Redux
│   └── Profile.jsx               ✅ UPDATED: Redux
├── styles/
│   ├── Home.css
│   ├── Auth.css
│   └── Profile.css
├── App.jsx                       ✅ UPDATED: Redux
├── App.css
├── main.jsx                      ✅ UPDATED: Redux Provider
└── ...
```

## Running the Application

### Install Dependencies:

```bash
cd frontend
npm install
```

### Start Development Server:

```bash
npm run dev
```

Server will run at: `http://localhost:5173`

### Build for Production:

```bash
npm run build
```

Output in: `frontend/dist/`

## Testing Checklist

- [ ] Register flow: Email → OTP → Complete Registration
- [ ] Login flow: Credentials → Token saved → Redirect to profile
- [ ] Auto-login: Refresh page → Should stay logged in
- [ ] Logout: Click logout → Token removed → Redirect to home
- [ ] Password reset: Email → OTP → New password → Login
- [ ] Protected routes: Try accessing `/profile` without login → Should redirect
- [ ] Redux DevTools: Check Redux state changes (if installed)
- [ ] Token persistence: Check localStorage after login
- [ ] Error handling: Try invalid credentials → Should show error message

## Performance Benefits

✅ **Faster Renders**: useSelector only re-renders when selector result changes
✅ **Less Boilerplate**: No useState for every piece of state
✅ **Reusable Logic**: Thunks can be dispatched from any component
✅ **Better DevTools**: Redux DevTools for time-travel debugging
✅ **Easier Testing**: Pure functions and reducers
✅ **Scalability**: Easy to add new slices for products, cart, orders, etc.

## Migration Complete! 🎉

All components have been successfully migrated from:
- ❌ Fetch API → ✅ Axios
- ❌ useState → ✅ Redux + Redux Hooks
- ❌ Prop drilling → ✅ Centralized state
- ❌ Manual localStorage → ✅ Redux Persist

**Next Steps:**
- Test the application thoroughly
- Add more Redux slices for products, cart, orders
- Implement Google OAuth with Redux
- Consider Redux DevTools for debugging
