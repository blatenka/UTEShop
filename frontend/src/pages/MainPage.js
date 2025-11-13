import React, { useState } from 'react';
import ForgotPassword from '../components/ForgotPassword';
import '../App.css';

const MainPage = () => {
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  return (
    <div className="main-page">
      <header className="main-header">
        <h1>UTEShop</h1>
        <p>Chào mừng bạn đến với UTEShop — cửa hàng mẫu.</p>
      </header>

      <main className="main-actions">
        <button
          className="btn-primary"
          onClick={() => setIsForgotOpen(true)}
        >
          Quên Mật Khẩu
        </button>

        <p className="hint">Hoặc đăng nhập nếu bạn đã có tài khoản.</p>
      </main>

      <ForgotPassword isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </div>
  );
};

export default MainPage;
