import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import ForgotPassword from '../components/ForgotPassword';

/**
 * Ví dụ về cách sử dụng component ForgotPassword
 * Có thể sử dụng component này trong trang login hoặc bất kỳ trang nào
 */

function LoginExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      // Gọi API login ở đây
      console.log('Login:', { email, password });
      // await loginAPI.login(email, password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Đăng Nhập UTEShop</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="btn-login"
          >
            {loginLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="btn-link"
            onClick={() => setIsForgotPasswordOpen(true)}
          >
            Quên mật khẩu?
          </button>
          <span className="divider">|</span>
          <a href="/register" className="btn-link">
            Tạo tài khoản mới
          </a>
        </div>
      </div>

      {/* Component Forgot Password Modal */}
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}

export default LoginExample;
