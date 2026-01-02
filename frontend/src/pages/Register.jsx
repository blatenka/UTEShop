import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { requestOtp, register, clearError, clearSuccess } from "../redux/slices/authSlice";
import "../styles/Auth.css";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1); // 1: fill info, 2: verify OTP
  const [localError, setLocalError] = useState("");

  // Step 1: Form data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Step 2: OTP verification
  const [otp, setOtp] = useState("");

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

    // Validation
    if (!formData.email || !formData.name || !formData.username || !formData.password) {
      setLocalError("Please fill all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords don't match");
      return;
    }

    dispatch(requestOtp(formData.email)).then((result) => {
      if (result.type === requestOtp.fulfilled.type) {
        setStep(2);
      }
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!otp) {
      setLocalError("Please enter OTP");
      return;
    }

    dispatch(
      register({
        email: formData.email,
        otp: otp,
        password: formData.password,
        name: formData.name,
        username: formData.username,
      })
    ).then((result) => {
      if (result.type === register.fulfilled.type) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>

        {(error || localError) && <div className="error-message">{error || localError}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                disabled={step === 2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                disabled={step === 2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                disabled={step === 2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Min. 6 characters"
                disabled={step === 2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                disabled={step === 2}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Sending OTP..." : "Request OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
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

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Verifying..." : "Complete Registration"}
            </button>

            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setStep(1);
                setOtp("");
                setLocalError("");
              }}
            >
              ← Back
            </button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
