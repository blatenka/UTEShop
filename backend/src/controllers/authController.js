import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { generateOTP } from '../utils/otpGenerator.js';
import { sendRegisterOtpEmail, sendForgotPasswordOtpEmail } from '../utils/emailService.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Request OTP cho đăng ký
export const requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email đã tồn tại.' });

        const otpCode = generateOTP(6); 

        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode },
            { upsert: true, new: true }
        );

        // Gửi email OTP
        const emailSent = await sendRegisterOtpEmail(email, otpCode, process.env.OTP_EXPIRE_MINUTES);

        if (!emailSent) {
            return res.status(500).json({ message: 'Lỗi gửi email. Vui lòng thử lại.' });
        }

        res.status(200).json({ message: 'Mã OTP đã được gửi đến email của bạn' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Đăng ký người dùng mới
export const register = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        await Otp.deleteOne({ email });

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng ký' });
    }
};

// Đăng nhập
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.', error: error.message });
    }
};

// Đăng nhập với Google
export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                password: await bcrypt.hash(Math.random().toString(36), 10),
                avatar: picture
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            message: "Đăng nhập Google thành công!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error("Lỗi xác thực Google:", error);
        res.status(400).json({ message: "Xác thực Google thất bại!" });
    }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email này chưa được đăng ký tài khoản." });
        }

        const otpCode = generateOTP(6);

        await Otp.findOneAndUpdate(
            { email },
            { otp: otpCode },
            { upsert: true, new: true }
        );

        // Gửi email OTP
        const emailSent = await sendForgotPasswordOtpEmail(email, otpCode, process.env.OTP_EXPIRE_MINUTES);

        if (!emailSent) {
            return res.status(500).json({ message: 'Lỗi gửi email. Vui lòng thử lại.' });
        }

        res.status(200).json({ message: 'Mã xác thực đã được gửi đến email của bạn.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Reset mật khẩu
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        await Otp.deleteOne({ email });

        res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.' });
    }
};