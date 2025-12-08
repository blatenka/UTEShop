import User from "../models/User.js";
import { generateOTP, otpExpires } from "../utils/otp.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "22110223";

/*
  POST /auth/request-otp
  Body: { email }
*/
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    const existingUser = await User.findOne({ email, isVerified: true });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Tao OTP
    const otp = generateOTP();
    const expiresAt = otpExpires(process.env.OTP_EXPIRE_MINUTES);

    // Luu tam OTP
    await User.findOneAndUpdate(
      { email },
      {
        $set: {
          otp: { code: otp, expiresAt },
        },
      },
      { upsert: true, new: true }
    );

    console.log(`OTP for ${email}: ${otp}`);

    res.json({ message: "OTP sent successfully", email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  POST /auth/register
  Body: { email, password, name, username, otp }
*/
export const register = async (req, res) => {
  try {
    const { email, password, name, username, otp } = req.body;
    
    // Kiem tra du lieu dau vao
    if (!email) return res.status(400).json({ message: "Email required" });
    if (!password) return res.status(400).json({ message: "Password required" });
    if (!name) return res.status(400).json({ message: "Name required" });
    if (!username) return res.status(400).json({ message: "Username required" });
    if (!otp) return res.status(400).json({ message: "OTP required" });

    // Xac thuc mat khau
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Tim user theo email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found. Please request OTP first" });

    // Kiem tra neu da xac thuc   
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    //
    if (!user.otp) return res.status(400).json({ message: "OTP not requested" });

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP expired. Please request a new one" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // kiem tra username da ton tai 
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Cap nhat user
    user.name = name;
    user.username = username;
    user.passwordHash = passwordHash;
    user.isVerified = true;
    user.otp = undefined;

    await user.save();

    res.json({
      message: "Register successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  POST /auth/forgot-password
  Body: { email }
*/
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });

    // Kiem tra user da dang ky
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(400).json({ message: "Email not found or not verified" });
    }

    // Tao OTP
    const otp = generateOTP();
    const expiresAt = otpExpires(process.env.OTP_EXPIRE_MINUTES);

    // Luu OTP cho reset password
    user.otp = { code: otp, expiresAt };
    await user.save();

    console.log(`OTP for password reset ${email}: ${otp}`);

    res.json({
      message: "OTP sent to your email",
      email,
      note: "Use this OTP to reset your password"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  POST /auth/reset-password
  Body: { email, otp, newPassword }
*/
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });
    if (!otp) return res.status(400).json({ message: "OTP required" });
    if (!newPassword) return res.status(400).json({ message: "New password required" });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Tim user
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Kiem tra OTP
    if (!user.otp) {
      return res.status(400).json({ message: "OTP not requested" });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: "OTP expired. Please request a new one" });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash mat khau moi
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Cap nhat password
    user.passwordHash = passwordHash;
    user.otp = undefined;
    await user.save();

    res.json({
      message: "Password reset successful",
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  Login with Email and Password
  POST /auth/login
  Body: { email, password }
*/
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email required" });
    if (!password) return res.status(400).json({ message: "Password required" });

    // Tim user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email or password incorrect" });
    }

    // Kiem tra xac thuc
    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified. Please complete registration" });
    }

    // So sanh password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email or password incorrect" });
    }

    // Tao JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  Google Login
  POST /auth/google-login
  Body: { googleId, email, name, picture }
*/
export const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId) return res.status(400).json({ message: "GoogleId required" });
    if (!email) return res.status(400).json({ message: "Email required" });

    // Tim user theo googleId
    let user = await User.findOne({ googleId });

    if (!user) {
      // Neu chua co user, tim theo email
      user = await User.findOne({ email });

      if (!user) {
        // Tao user moi
        user = new User({
          googleId,
          email,
          name,
          picture,
          isVerified: true, // Google verified
        });
      } else {
        // Cap nhat googleId neu user exist
        user.googleId = googleId;
        if (picture) user.picture = picture;
      }
    }

    // Ensure user is verified
    user.isVerified = true;
    await user.save();

    // Tao JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*
  Get User Profile
  GET /auth/profile
  Headers: Authorization: Bearer TOKEN
*/
export const getProfile = async (req, res) => {
  try {
    // Lay userId tu token (middleware se set req.userId)
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "id email name username picture googleId isVerified createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        picture: user.picture,
        googleId: user.googleId,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
