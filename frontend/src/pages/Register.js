import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtpThunk, registerThunk } from "../redux/authSlice";

function Register() {
  const dispatch = useDispatch();
  const { loading, otpSent } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const sendOtpHandler = () => {
    dispatch(sendOtpThunk(email));
  };

  const registerHandler = () => {
    dispatch(registerThunk({ email, otp, password }));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Đăng ký tài khoản</h2>

      <input
        placeholder="Email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button disabled={loading} onClick={sendOtpHandler}>
        Gửi OTP
      </button>

      {otpSent && (
        <>
          <input
            placeholder="Nhập OTP..."
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button disabled={loading} onClick={registerHandler}>
            Đăng ký
          </button>
        </>
      )}
    </div>
  );
}

export default Register;
