import User from '../models/User.js';
import bcrypt from 'bcryptjs';

// Get profile người dùng
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.status(200).json({
            message: "Thông tin cá nhân",
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Update profile người dùng
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, address, city } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Update thông tin
        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (address) user.address = address;
        if (city) user.city = city;

        await user.save();

        res.status(200).json({
            message: "Cập nhật thông tin thành công!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi cập nhật thông tin', error: error.message });
    }
};

// Upload/Update avatar
export const updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Lưu URL từ Cloudinary
        user.avatar = req.file.path;
        await user.save();

        res.status(200).json({
            message: "Cập nhật avatar thành công!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi upload avatar', error: error.message });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ các trường.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu mới không khớp.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
        }

        // Hash và lưu mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Thay đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi thay đổi mật khẩu', error: error.message });
    }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            message: "Danh sách người dùng",
            users
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách người dùng" });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: "Không thể xóa Admin" });
            }
            await user.deleteOne();
            res.status(200).json({ message: "Đã xóa người dùng thành công" });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa người dùng" });
    }
};

export const addToWishlist = async (req, res) => {
    try {
        const { id } = req.body; // Lấy bookId từ body request
        const user = await User.findById(req.user.id);

        // Sử dụng $addToSet để tránh trùng lặp
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $addToSet: { wishlist: id },
            },
            { new: true }
        );

        res.status(200).json({ message: "Đã thêm vào danh sách yêu thích" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi thêm wishlist: " + error.message });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { id } = req.params; // Lấy bookId từ URL params

        // Sử dụng $pull để xóa phần tử khớp với id
        await User.findByIdAndUpdate(
            req.user.id,
            {
                $pull: { wishlist: id },
            },
            { new: true }
        );

        res.status(200).json({ message: "Đã xóa khỏi danh sách yêu thích" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi xóa wishlist" });
    }
};

export const getMyWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'wishlist',
            select: 'title price image category slug countInStock' // Chỉ lấy các trường cần thiết để hiển thị card
        });

        res.status(200).json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách yêu thích" });
    }
};
