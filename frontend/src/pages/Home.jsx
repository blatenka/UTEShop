import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBooks } from "../api";
import { addToCart } from "../redux/slices/cartSlice";
import "../styles/Home.css";
import { Helmet } from "react-helmet";
import { FaShoppingCart, FaCrown, FaBox, FaUser, FaSearch } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [quantity, setQuantity] = useState(1);

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

  const handleAddToCart = (book) => {
    if (book.countInStock === 0) {
      alert("Sách này đã hết hàng");
      return;
    }
    
    dispatch(addToCart({
      product: book._id,
      title: book.title,
      qty: quantity,
      price: book.price,
      image: book.image,
    }));
    
    setSelectedBook(null);
    setQuantity(1);
    alert("Đã thêm vào giỏ hàng!");
  };

  return (
    <div className="home">
      <Helmet>
        <title>Trang chủ - UTEShop</title>
      </Helmet>
      
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop
          </Link>
          
          <div className="navbar-menu">
            <Link to="/cart" className="nav-btn btn-cart">
              <FaShoppingCart /> Giỏ hàng ({cartItems.length})
            </Link>
            
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin" className="nav-btn btn-admin">
                    <FaCrown /> Admin
                  </Link>
                )}
                <span className="user-name">{user.name}</span>
                <Link to="/orders" className="nav-btn btn-info">
                  <FaBox /> Đơn hàng
                </Link>
                <Link to="/profile" className="nav-btn btn-secondary">
                  <FaUser /> Hồ sơ
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn btn-secondary">
                  Đăng nhập
                </Link>
                <Link to="/register" className="nav-btn btn-primary">
                  Đăng ký
                </Link>
              </>
            )}
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
              <FaSearch /> Tìm kiếm
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
                <div key={book._id} className="product-card">
                  <Link to={`/book/${book._id}`} className="product-card-link">
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
                  </Link>
                  
                  <button 
                    className={`btn btn-add-to-cart ${book.countInStock === 0 ? 'disabled' : ''}`}
                    onClick={() => setSelectedBook(book)}
                    disabled={book.countInStock === 0}
                  >
                    {book.countInStock === 0 ? 'Hết hàng' : '🛒 Thêm vào giỏ'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add to Cart Modal */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedBook(null)}>
              ×
            </button>
            <h3>{selectedBook.title}</h3>
            <p className="modal-price">
              Giá: {selectedBook.price.toLocaleString("vi-VN")} ₫
            </p>
            
            <div className="quantity-section">
              <label>Số lượng:</label>
              <div className="qty-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="qty-input"
                  min="1"
                  max={selectedBook.countInStock}
                />
                <button
                  onClick={() => setQuantity(Math.min(selectedBook.countInStock, quantity + 1))}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              <p className="stock-info">Tồn kho: {selectedBook.countInStock}</p>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedBook(null)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleAddToCart(selectedBook)}
              >
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2024 UTEShop. Tất cả quyền được bảo lưu.</p>
      </footer>
    </div>
  );
}

export default Home;
