import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { requestOtp, register, clearError, clearSuccess } from "../redux/slices/authSlice";
import "../styles/Auth.css";
import { Helmet} from "react-helmet";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [otpRequested, setOtpRequested] = useState(false);
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());

    if (!formData.email) {
      setLocalError("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Email không hợp lệ");
      return;
    }

    dispatch(requestOtp(formData.email)).then((result) => {
      if (result.type === requestOtp.fulfilled.type) {
        setOtpRequested(true);
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());

    if (!formData.otp) {
      setLocalError("Vui lòng nhập mã OTP");
      return;
    }

    if (!formData.name) {
      setLocalError("Vui lòng nhập tên người dùng");
      return;
    }

    if (!formData.password) {
      setLocalError("Vui lòng nhập mật khẩu");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp");
      return;
    }

    dispatch(
      register({
        email: formData.email,
        password: formData.password,
        otp: formData.otp,
        name: formData.name,
        confirmPassword: formData.confirmPassword,
      })
    ).then((result) => {
      if (result.type === register.fulfilled.type) {
        dispatch(clearSuccess());
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    });
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Đăng ký - UTEShop</title>
      </Helmet>
      <div className="auth-card">
        <h2 className="auth-title">Đăng ký tài khoản</h2>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            Đăng nhập
          </Link>
          <div className="auth-tab active">Đăng ký</div>
        </div>

        {/* Thông báo lỗi/thành công */}
        {localError && <div className="error-message">{localError}</div>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={otpRequested ? handleRegister : handleRequestOTP}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Nhập email"
              disabled={otpRequested}
            />
          </div>

          {!otpRequested && (
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Đang gửi OTP..." : "Nhận OTP qua email"}
            </button>
          )}

          <div className="form-group">
            <label htmlFor="otp">Mã OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData((prev) => ({
                  ...prev,
                  otp: value,
                }));
              }}
              placeholder="Nhập 6 chữ số"
              maxLength="6"
              disabled={!otpRequested}
              className="otp-input-large"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Tên người dùng</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nhập tên"
              disabled={!otpRequested}
            />
          </div>

          {/* Mật khẩu */}
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
                disabled={!otpRequested}
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

          {/* Nhập lại mật khẩu */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Nhập lại mật khẩu</label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                disabled={!otpRequested}
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "Ẩn" : "Hiển"}
              </button>
            </div>
          </div>

          {otpRequested && (
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          )}

          {otpRequested && (
            <button
              type="button"
              className="btn-back"
              onClick={() => {
                setOtpRequested(false);
                setFormData({ ...formData, otp: "", name: "", password: "", confirmPassword: "" });
                setLocalError("");
              }}
            >
              ← Quay lại
            </button>
          )}
        </form>

        <div className="auth-footer-disclaimer">
          Bằng việc đăng ký, bạn đã đồng ý với UTEShop về{" "}
          <a href="#" className="link">Điều khoản dịch vụ</a> &{" "}
          <a href="#" className="link">Chính sách bảo mật</a>
        </div>
      </div>
    </div>
  );
}

export default Register;
