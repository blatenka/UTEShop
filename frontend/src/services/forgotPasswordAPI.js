import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Forgot Password
export const forgotPasswordAPI = {
  requestOTP: (email) =>
    axiosInstance.post('/password-reset/request-otp', { email }),

  verifyOTP: (email, otp) =>
    axiosInstance.post('/password-reset/verify-otp', { email, otp }),

  resetPassword: (email, resetToken, newPassword, confirmPassword) =>
    axiosInstance.post('/password-reset/reset-password', {
      email,
      resetToken,
      newPassword,
      confirmPassword,
    }),
};

export default axiosInstance;
