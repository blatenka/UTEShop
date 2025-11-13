import { configureStore } from '@reduxjs/toolkit';
import forgotPasswordReducer from './forgotPasswordSlice';

export const store = configureStore({
  reducer: {
    forgotPassword: forgotPasswordReducer,
    // Thêm các reducers khác ở đây
  },
});

export default store;
