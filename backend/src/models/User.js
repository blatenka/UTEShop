import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  code: String,
  expiresAt: Date,
});

const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    picture: { type: String }, // Avatar URL từ Google
    isVerified: { type: Boolean, default: false },
    otp: OtpSchema,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
