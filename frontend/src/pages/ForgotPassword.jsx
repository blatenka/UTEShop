import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, resetPassword, clearError, clearSuccess } from "../redux/slices/authSlice";
import "../styles/Auth.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [localError, setLocalError] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email) {
      setLocalError("Please enter your email");
      return;
    }

    dispatch(forgotPassword(email)).then((result) => {
      if (result.type === forgotPassword.fulfilled.type) {
        setStep(2);
      }
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!otp || !newPassword) {
      setLocalError("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }

    dispatch(
      resetPassword({
        email,
        otp,
        newPassword,
      })
    ).then((result) => {
      if (result.type === resetPassword.fulfilled.type) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Reset Password</h1>

        {(error || localError) && <div className="error-message">{error || localError}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Sending OTP..." : "Request OTP"}
            </button>

            <Link to="/login" className="btn btn-link">
              ← Back to Login
            </Link>
          </form>
        ) : step === 2 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
          >
            <div className="form-group">
              <label htmlFor="otp">Enter OTP *</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
              />
              <small>Check your console for OTP (dev mode)</small>
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Verify OTP
            </button>

            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
            >
              ← Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password *</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setStep(2);
                setNewPassword("");
                setConfirmPassword("");
              }}
            >
              ← Back
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
