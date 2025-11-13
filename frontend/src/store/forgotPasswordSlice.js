import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { forgotPasswordAPI } from '../services/forgotPasswordAPI';

// Async Thunks
export const requestOTP = createAsyncThunk(
  'forgotPassword/requestOTP',
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordAPI.requestOTP(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi yêu cầu OTP'
      );
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'forgotPassword/verifyOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await forgotPasswordAPI.verifyOTP(email, otp);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi xác minh OTP'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'forgotPassword/resetPassword',
  async (
    { email, resetToken, newPassword, confirmPassword },
    { rejectWithValue }
  ) => {
    try {
      const response = await forgotPasswordAPI.resetPassword(
        email,
        resetToken,
        newPassword,
        confirmPassword
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi đặt lại mật khẩu'
      );
    }
  }
);

// Slice
const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState: {
    email: '',
    resetToken: '',
    step: 1, // 1: Nhập email, 2: Xác minh OTP, 3: Đặt lại mật khẩu
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
    },
    resetState: (state) => {
      state.email = '';
      state.resetToken = '';
      state.step = 1;
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Request OTP
    builder
      .addCase(requestOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.step = 2;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(requestOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.resetToken = action.payload.data.resetToken;
        state.step = 3;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.step = 1;
        state.email = '';
        state.resetToken = '';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setEmail, resetState, clearError } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;
