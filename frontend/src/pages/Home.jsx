import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {

  return (
    <div className="home">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop
          </Link>
          
          <div className="navbar-menu">
            <Link to="/login" className="nav-btn btn-secondary">
              Đăng nhập
            </Link>
            <Link to="/register" className="nav-btn btn-primary">
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <h1>Chào mừng đến với UTEShop</h1>
          <p>Khám phá những sản phẩm tuyệt vời với giá cả phải chăng</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Bắt đầu
            </Link>
          </div>
        </div>
      </div>

      <div className="products-section">
        <div className="container">
          <h2>Sản phẩm nổi bật</h2>
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className="product-card">
                <div className="product-image">
                  <div className="placeholder">Product {id}</div>
                </div>
                <div className="product-info">
                  <h3>Sản phẩm {id}</h3>
                  <p className="price">99.99 VND</p>
                  <button className="btn btn-secondary">Thêm vào giỏ</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default Home;
