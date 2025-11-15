import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sendOtp, registerUser } from "../api/authApi";

// Thunk gửi OTP
export const sendOtpThunk = createAsyncThunk("auth/sendOtp", async (email) => {
  const res = await sendOtp(email);
  return res.data;
});

// Thunk đăng ký
export const registerThunk = createAsyncThunk("auth/register", async (data) => {
  const res = await registerUser(data);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    otpSent: false,
    user: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendOtpThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendOtpThunk.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      });
  },
});

export default authSlice.reducer;
