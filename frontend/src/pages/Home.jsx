import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBooks } from "../api";
import "../styles/Home.css";

function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async (keyword = "") => {
    try {
      setLoading(true);
      const data = await getBooks(keyword);
      setBooks(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách sách. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(searchKeyword);
  };

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
          <p>Khám phá những cuốn sách tuyệt vời với giá cả phải chăng</p>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm sách..."
              className="search-input"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      <div className="products-section">
        <div className="container">
          <h2>Danh sách sách</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Đang tải sách...</div>
          ) : books.length === 0 ? (
            <div className="no-products">Không tìm thấy sách nào.</div>
          ) : (
            <div className="products-grid">
              {books.map((book) => (
                <Link
                  to={`/book/${book._id}`}
                  key={book._id}
                  className="product-card-link"
                >
                  <div className="product-card">
                    <div className="product-image">
                      <img
                        src={book.image}
                        alt={book.title}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/200x300?text=No+Image";
                        }}
                      />
                      {book.countInStock === 0 && (
                        <div className="out-of-stock">Hết hàng</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{book.title}</h3>
                      <p className="author">Tác giả: {book.author}</p>
                      <div className="price-section">
                        <span className="price">
                          {book.price.toLocaleString("vi-VN")} ₫
                        </span>
                        {book.originalPrice > book.price && (
                          <span className="original-price">
                            {book.originalPrice.toLocaleString("vi-VN")} ₫
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default Home;
