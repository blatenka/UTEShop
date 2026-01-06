import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Khởi tạo transporter với cấu hình Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Tải nội dung template HTML từ file
 * @param {string} templateName - Tên file template (không có phần mở rộng)
 * @returns {string}
 */
const loadTemplate = (templateName) => {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf8');
};

/**
 * Thay thế các biến trong template
 * @param {string} template - Nội dung template
 * @param {object} variables - Đối tượng chứa các biến cần thay thế
 * @returns {string}
 */
const renderTemplate = (template, variables) => {
    let html = template;
    Object.keys(variables).forEach(key => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
    });
    return html;
};

/**
 * Gửi email OTP cho đăng ký
 * @param {string} email - Email của người dùng
 * @param {string} otp - Mã OTP
 * @param {string} expireMinutes - Thời gian hết hạn (phút)
 * @returns {Promise<boolean>}
 */
export const sendRegisterOtpEmail = async (email, otp, expireMinutes = 10) => {
    try {
        const template = loadTemplate('registerOtp');
        const html = renderTemplate(template, { email, otp, expireMinutes });


        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác thực đăng ký tài khoản UTEShop',
            html: html
        });

        console.log(`✓ Email xác thực đã được gửi đến ${email}`);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error.message);
        return false;
    }
};

/**
 * Gửi email OTP cho quên mật khẩu
 * @param {string} email - Email của người dùng
 * @param {string} otp - Mã OTP
 * @param {string} expireMinutes - Thời gian hết hạn (phút)
 * @returns {Promise<boolean>}
 */
export const sendForgotPasswordOtpEmail = async (email, otp, expireMinutes = 10) => {
    try {
        const template = loadTemplate('forgotPasswordOtp');
        const html = renderTemplate(template, { email, otp, expireMinutes });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Mã xác thực đặt lại mật khẩu UTEShop',
            html: html
        });

        console.log(`✓ Email xác thực đã được gửi đến ${email}`);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error.message);
        return false;
    }
};
