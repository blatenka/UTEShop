import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "http://localhost:5000/api/user";

// Lấy thông tin profile
export const fetchProfile = createAsyncThunk("user/fetchProfile", async () => {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API}/profile`, {
    headers: { Authorization: token }
  });
  return res.data;
});

// Cập nhật profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API}/profile`, data, {
        headers: { Authorization: token }
      });
      return res.data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Cập nhật thất bại");
    }
  }
);

// Đổi mật khẩu
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API}/change-password`, data, {
        headers: { Authorization: token }
      });
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  }
);

// Xóa tài khoản
export const deleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API}/profile`, {
        headers: { Authorization: token }
      });
      localStorage.removeItem("token");
      return res.data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Xóa tài khoản thất bại");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    success: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
    logout: (state) => {
      state.profile = null;
      localStorage.removeItem("token");
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.success = "Cập nhật thông tin thành công!";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete account
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.profile = null;
        state.success = "Xóa tài khoản thành công";
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages, logout } = userSlice.actions;
export default userSlice.reducer;