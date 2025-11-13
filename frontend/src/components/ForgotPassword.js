import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  requestOTP,
  verifyOTP,
  resetPassword,
  resetState,
  clearError,
} from '../store/forgotPasswordSlice';
import './ForgotPassword.css';

const ForgotPassword = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { step, loading, error, message, email, resetToken, success } =
    useSelector((state) => state.forgotPassword);

  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [timer, setTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Timer
  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  useEffect(() => {
    if (step === 2 && timer === 0) {
      setTimer(300); // 5 phút
    }
  }, [step]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Vui lòng nhập email');
      return;
    }
    dispatch(requestOTP(formData.email));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      alert('Vui lòng nhập OTP');
      return;
    }
    dispatch(verifyOTP({ email: formData.email, otp: formData.otp }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.newPassword || !formData.confirmPassword) {
      alert('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu không trùng khớp');
      return;
    }

    dispatch(
      resetPassword({
        email: formData.email,
        resetToken,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
    );
  };

  const handleClose = () => {
    dispatch(resetState());
    setFormData({
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
    setTimer(0);
    onClose();
  };

  // Tự động đóng modal khi thành công
  useEffect(() => {
    if (success && step === 1) {
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  }, [success, step]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="forgot-password-modal-overlay">
      <div className="forgot-password-modal">
        <div className="forgot-password-header">
          <h2>Quên Mật Khẩu</h2>
          <button
            className="close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button
              className="alert-close"
              onClick={() => dispatch(clearError())}
            >
              ✕
            </button>
          </div>
        )}

        {message && success && (
          <div className="alert alert-success">
            {message}
          </div>
        )}

        <form className="forgot-password-form">
          {/* Step 1: Nhập Email */}
          {step === 1 && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email của bạn"
                disabled={loading}
              />
              <button
                type="submit"
                onClick={handleRequestOTP}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Đang gửi...' : 'Gửi OTP'}
              </button>
            </div>
          )}

          {/* Step 2: Xác Minh OTP */}
          {step === 2 && (
            <div className="form-group">
              <label htmlFor="otp">Mã OTP</label>
              <p className="text-info">
                Mã OTP đã được gửi đến <strong>{formData.email}</strong>
              </p>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Nhập mã OTP 6 chữ số"
                maxLength="6"
                disabled={loading}
              />
              <div className="timer-wrapper">
                <span className="timer">
                  Hết hạn trong: {formatTime(timer)}
                </span>
              </div>
              <button
                type="submit"
                onClick={handleVerifyOTP}
                disabled={loading || timer === 0}
                className="btn-primary"
              >
                {loading ? 'Đang xác minh...' : 'Xác Minh OTP'}
              </button>
              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={loading}
                className="btn-secondary"
              >
                Gửi lại OTP
              </button>
            </div>
          )}

          {/* Step 3: Đặt Lại Mật Khẩu */}
          {step === 3 && (
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Xác nhận mật khẩu"
                disabled={loading}
              />

              <button
                type="submit"
                onClick={handleResetPassword}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Đang đặt lại...' : 'Đặt Lại Mật Khẩu'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
