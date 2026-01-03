import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, googleLogin, clearError, clearSuccess } from "../redux/slices/authSlice";
import { GoogleLogin } from "@react-oauth/google";
import "../styles/Auth.css";
import { Helmet } from "react-helmet";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, user } = useSelector((state) => state.auth);

  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Nếu user đã đăng nhập, chuyển hướng đến profile
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());

    if (!formData.email) {
      setLocalError("Vui lòng nhập email");
      return;
    }

    if (!formData.password) {
      setLocalError("Vui lòng nhập mật khẩu");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Email không hợp lệ");
      return;
    }

    dispatch(
      login({
        email: formData.email,
        password: formData.password,
      })
    ).then((result) => {
      if (result.type === login.fulfilled.type) {
        dispatch(clearSuccess());
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      }
    });
  };

  const handleGoogleSuccess = (credentialResponse) => {
    setLocalError("");
    dispatch(clearError());
    
    const idToken = credentialResponse.credential;
    dispatch(googleLogin(idToken)).then((result) => {
      if (result.type === googleLogin.fulfilled.type) {
        dispatch(clearSuccess());
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      }
    });
  };

  const handleGoogleError = () => {
    setLocalError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Đăng nhập - UTEShop</title>
      </Helmet>
      <div className="auth-card">
        <h2 className="auth-title">Đăng nhập tài khoản</h2>

        <div className="auth-tabs">
          <div className="auth-tab active">Đăng nhập</div>
          <Link to="/register" className="auth-tab">
            Đăng ký
          </Link>
        </div>

        {/* Thông báo lỗi/thành công */}
        {localError && <div className="error-message">{localError}</div>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="password-input-group">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Ẩn" : "Hiển"}
              </button>
            </div>
          </div>

          <div className="form-footer">
            <div></div>
            <Link to="/forgot-password" className="link">
              Quên mật khẩu?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="divider">
          <span>Hoặc</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            text="signin_with"
            locale="vi"
          />
        </div>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
