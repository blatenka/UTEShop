import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  resetPassword,
  clearError,
  clearSuccess,
} from "../redux/slices/authSlice";
import "../styles/Auth.css";
import { Helmet } from "react-helmet";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";

function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const timerRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cleanup interval khi unmount hoặc khi countdown về 0
  useEffect(() => {
    if (resendCountdown === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resendCountdown]);

  const startCountdown = (seconds) => {
    // Tránh tạo nhiều interval
    if (timerRef.current) clearInterval(timerRef.current);
    setResendCountdown(seconds);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");
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

    dispatch(forgotPassword(formData.email)).then((result) => {
      if (result.type === forgotPassword.fulfilled.type) {
        setStep(2);
        startCountdown(600); // 10 phút
      }
    });
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");
    dispatch(clearError());

    if (!formData.otp) {
      setLocalError("Vui lòng nhập mã OTP");
      return;
    }

    if (!formData.newPassword) {
      setLocalError("Vui lòng nhập mật khẩu mới");
      return;
    }

    if (formData.newPassword.length < 6) {
      setLocalError("Mật khẩu phải ít nhất 6 ký tự");
      return;
    }

    if (!formData.confirmPassword) {
      setLocalError("Vui lòng nhập xác nhận mật khẩu");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp");
      return;
    }

    dispatch(
      resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    ).then((result) => {
      if (result.type === resetPassword.fulfilled.type) {
        setSuccessMessage("Bạn đã đổi mật khẩu thành công!");
        dispatch(clearSuccess());
        // Có thể xoá OTP và password sau khi đổi
        setFormData((prev) => ({
          ...prev,
          otp: "",
          newPassword: "",
          confirmPassword: "",
        }));
        // Điều hướng sau 2 giây
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    });
  };

  const handleResendOTP = () => {
    setLocalError("");
    setSuccessMessage("");
    dispatch(clearError());

    if (!formData.email) {
      setLocalError("Vui lòng nhập email trước khi yêu cầu gửi lại OTP");
      return;
    }

    dispatch(forgotPassword(formData.email)).then((result) => {
      if (result.type === forgotPassword.fulfilled.type) {
        startCountdown(600); // 10 phút
      }
    });
  };

  return (
    <div className="auth-container">
      <Helmet>
        <title>Quên mật khẩu - UTEShop</title>
      </Helmet>
      <div className="auth-card">
        <h2 className="auth-title">Quên mật khẩu</h2>

        <div className="auth-tabs">
          <Link to="/login" className="auth-tab">
            Đăng nhập
          </Link>
          <div className="auth-tab active">Quên mật khẩu</div>
          <Link to="/register" className="auth-tab">
            Đăng ký
          </Link>
        </div>

        {/* Thông báo lỗi/thành công */}
        {localError && <div className="error-message">{localError}</div>}
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Step 1: Email */}
        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email của bạn"
              />
            </div>

            <p className="form-hint">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã xác thực OTP để bạn có thể đặt lại mật khẩu.
            </p>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Đang gửi..." : <><FaLock /> Yêu cầu mã OTP</>}
            </button>
          </form>
        ) : (
          /* Step 2: OTP & Password */
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="otp">Mã OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Nhập mã OTP"
                maxLength="6"
              />
              <small className="form-text-light">
                Mã OTP đã được gửi đến email: <strong>{formData.email}</strong>
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Xác nhận mật khẩu mới"
                />
                <button
                  type="button"
                  className="show-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-footer">
              <button
                type="button"
                className="link"
                onClick={handleResendOTP}
                disabled={resendCountdown > 0 || loading}
              >
                {resendCountdown > 0
                  ? `Gửi lại OTP (${resendCountdown}s)`
                  : "Gửi lại mã OTP"}
              </button>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setStep(1);
                  setFormData({
                    email: "",
                    otp: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setLocalError("");
                  setSuccessMessage("");
                  dispatch(clearError());
                  if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                  }
                  setResendCountdown(0);
                }}
              >
                Dùng email khác
              </button>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              <FaLock /> {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Bạn đã nhớ mật khẩu? <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
