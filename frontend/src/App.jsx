import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout } from "./redux/slices/authSlice";
import "./App.css";

// Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch profile on page load if token exists
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading && !user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home onLogout={handleLogout} />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/profile" /> : <Register />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={isLoggedIn ? <Profile onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
