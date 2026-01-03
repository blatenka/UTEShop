import Joi from 'joi';

// Validator for registration
export const registerValidator = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(30).required().messages({
            'string.min': 'Tên phải có ít nhất 3 ký tự',
            'any.required': 'Tên không được để trống'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email không được để trống'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu phải từ 6 ký tự trở lên',
            'any.required': 'Mật khẩu không được để trống'
        }),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
            'any.only': 'Mật khẩu nhập lại không khớp',
            'any.required': 'Vui lòng nhập lại mật khẩu'
        }),
        otp: Joi.string().length(6).required().messages({
            'string.length': 'Mã OTP phải có đúng 6 chữ số',
            'any.required': 'Vui lòng nhập mã OTP'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
// Validator for login
export const loginValidator = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email không được để trống'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Mật khẩu không được để trống'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};
//Validator for request OTP for forgot password
export const resetPasswordValidator = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email không được để trống'
        }),
        otp: Joi.string().length(6).required().messages({
            'string.length': 'Mã OTP phải có 6 số',
            'any.required': 'Vui lòng nhập OTP'
        }),
        newPassword: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu mới phải từ 6 ký tự',
            'any.required': 'Vui lòng nhập mật khẩu mới'
        }),
        confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
            'any.only': 'Mật khẩu nhập lại không khớp',
            'any.required': 'Vui lòng xác nhận mật khẩu mới'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
};