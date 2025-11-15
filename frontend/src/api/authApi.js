import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // thay bằng endpoint backend
});

// Gửi OTP
export const sendOtp = (email) => {
  return api.post("/auth/send-otp", { email });
};

// Đăng ký tài khoản
export const registerUser = (data) => {
  return api.post("/auth/register", data);
};
