import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { generateOTP } from '../utils/otpGenerator.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        // 1. Xác thực idToken gửi từ Frontend lên xem có đúng do Google cấp không
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        // 2. Tìm user trong DB theo email
        let user = await User.findOne({ email });

        // 3. Nếu chưa có user thì tạo mới (Đăng ký bằng Google)
        if (!user) {
            user = new User({
                name,
                email,
                // Vì đăng nhập qua Google nên không cần pass, 
                // ta tạo một pass ngẫu nhiên để tránh lỗi DB
                password: await bcrypt.hash(Math.random().toString(36), 10),
                avatar: picture // Có thể lưu cả ảnh đại diện từ Google
            });
            await user.save();
        }

        // 4. Tạo JWT của hệ thống mình để user sử dụng lâu dài
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

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // Ẩn mật khẩu vì lý do bảo mật
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách người dùng" });
    }
};

// Xóa người dùng (Nếu cần)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') return res.status(400).json({ message: "Không thể xóa Admin" });
            await user.deleteOne();
            res.status(200).json({ message: "Đã xóa người dùng thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa người dùng" });
    }
};