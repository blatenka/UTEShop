import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/otpGenerator.js';

// Dùng export const thay vì exports.
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

        console.log("-----------------------------------------");
        console.log(`[DEV MODE] OTP cho ${email} là: ${otpCode}`);
        console.log(`Mã sẽ hết hạn sau ${process.env.OTP_EXPIRE_MINUTES} phút.`);
        console.log("-----------------------------------------");

        res.status(200).json({ message: 'Mã OTP đã được tạo thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

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

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra email tồn tại
        const user = await User.findOne({ email });
        //console.log(email, password);
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        // 2. So sánh mật khẩu (dùng bcrypt.compare)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không chính xác.' });
        }

        // 3. Tạo JWT Token
        // Payload chứa ID và Role (để sau này phân quyền Admin)
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' } // Token hết hạn sau 1 ngày
        );

        // 4. Trả về thông tin user (không gửi mật khẩu) và token
        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.', error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.status(200).json({
            message: "Chào mừng bạn đến với trang cá nhân",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

        // Khác với đăng ký, quên mật khẩu yêu cầu email PHẢI tồn tại
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

        console.log("-----------------------------------------");
        console.log(`[FORGOT PASSWORD] OTP cho ${email} là: ${otpCode}`);
        console.log("-----------------------------------------");

        res.status(200).json({ message: 'Mã xác thực đã được gửi đến email của bạn.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Kiểm tra OTP
        const validOtp = await Otp.findOne({ email, otp });
        if (!validOtp) {
            return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn.' });
        }

        // Băm mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật mật khẩu cho User
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        // Xóa OTP
        await Otp.deleteOne({ email });

        res.status(200).json({ message: 'Mật khẩu đã được thay đổi thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.' });
    }
};