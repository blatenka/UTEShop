import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, logout, clearError } from "../redux/slices/authSlice";
import "../styles/Profile.css";
import { Helmet } from "react-helmet";
import { FaUser, FaSignOutAlt, FaBox } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Nếu không có token, chuyển hướng về đăng nhập
    if (!token) {
      navigate("/login");
      return;
    }

    // Nếu chưa có thông tin user, lấy từ API
    if (!user && token) {
      dispatch(getProfile());
    }
  }, [token, user, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-box">
          <p className="error-message">{error}</p>
          <Link to="/login" className="btn btn-primary">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Helmet>
        <title>Hồ sơ - UTEShop</title>
      </Helmet>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop
          </Link>

          <div className="navbar-menu">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="nav-btn btn-secondary">
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-placeholder">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <p className="profile-role">
                {user?.role === "admin" ? "👑 Quản trị viên" : <><FaUser /> Khách hàng</>}
              </p>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <h2>Thông tin chi tiết</h2>

            <div className="details-grid">
              <div className="detail-item">
                <label>ID người dùng</label>
                <p className="detail-value">{user?.id}</p>
              </div>

              <div className="detail-item">
                <label>Email</label>
                <p className="detail-value">{user?.email}</p>
              </div>

              <div className="detail-item">
                <label>Tên người dùng</label>
                <p className="detail-value">{user?.name}</p>
              </div>

              <div className="detail-item">
                <label>Vai trò</label>
                <p className="detail-value">
                  {user?.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            <button className="btn btn-secondary">Chỉnh sửa hồ sơ</button>
            <button className="btn btn-secondary">Đổi mật khẩu</button>
            <button onClick={handleLogout} className="btn btn-danger">
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="quick-links">
          <Link to="/" className="quick-link-card">
            <span className="icon">🏠</span>
            <span className="text">Trang chủ</span>
          </Link>
          <Link to="/orders" className="quick-link-card">
            <span className="icon"><FaBox /></span>
            <span className="text">Đơn hàng</span>
          </Link>
          <Link to="/" className="quick-link-card">
            <span className="icon">❤️</span>
            <span className="text">Yêu thích</span>
          </Link>
          <Link to="/" className="quick-link-card">
            <span className="icon">⚙️</span>
            <span className="text">Cài đặt</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;
