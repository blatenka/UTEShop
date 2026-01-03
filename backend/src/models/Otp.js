import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    // Lấy giá trị từ .env, nhân với 60 để ra số giây
    expires: Number(process.env.OTP_EXPIRE_MINUTES) * 60 
  } 
});

export default mongoose.model('Otp', otpSchema);