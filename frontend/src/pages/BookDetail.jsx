import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBookById } from "../api";
import "../styles/BookDetail.css";
import { Helmet } from "react-helmet";
import { FaArrowLeft, FaShoppingCart } from "react-icons/fa";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const data = await getBookById(id);
      setBook(data);
      setError(null);
    } catch (err) {
      setError("Không thể tải chi tiết sách. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail">
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
        <div className="loading">Đang tải thông tin sách...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="book-detail">
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
        <div className="error-container">
          <div className="error-message">{error || "Sách không tồn tại"}</div>
          <Link to="/" className="btn btn-primary">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const discountPercent =
    book.originalPrice > book.price
      ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
      : 0;

  return (
    <div className="book-detail">
      <Helmet>
        <title>{book.title} - UTEShop</title>
      </Helmet>
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

      <div className="breadcrumb">
        <div className="container">
          <Link to="/" className="breadcrumb-link">
            Trang chủ
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{book.title}</span>
        </div>
      </div>

      <div className="detail-container">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Quay lại
          </button>

          <div className="detail-content">
            <div className="detail-image">
              <img
                src={book.image}
                alt={book.title}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x600?text=No+Image";
                }}
              />
              {discountPercent > 0 && (
                <div className="discount-badge">-{discountPercent}%</div>
              )}
            </div>

            <div className="detail-info">
              <h1 className="book-title">{book.title}</h1>

              <div className="book-meta">
                <div className="meta-item">
                  <span className="label">Tác giả:</span>
                  <span className="value">{book.author}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Danh mục:</span>
                  <span className="value">{book.category}</span>
                </div>
              </div>

              <div className="rating-section">
                <div className="rating">
                  {"⭐".repeat(Math.round(book.rating) || 0)}
                  <span className="rating-text">
                    {book.numReviews > 0
                      ? `${book.rating.toFixed(1)}/5 (${book.numReviews} đánh giá)`
                      : "Chưa có đánh giá"}
                  </span>
                </div>
              </div>

              <div className="price-section">
                <span className="current-price">
                  {book.price.toLocaleString("vi-VN")} ₫
                </span>
                {book.originalPrice > book.price && (
                  <span className="original-price">
                    {book.originalPrice.toLocaleString("vi-VN")} ₫
                  </span>
                )}
              </div>

              <div className="stock-status">
                {book.countInStock > 0 ? (
                  <span className="in-stock">
                    ✓ Còn {book.countInStock} cuốn trong kho
                  </span>
                ) : (
                  <span className="out-of-stock">✗ Hết hàng</span>
                )}
              </div>

              <div className="sales-info">
                <span>Đã bán: {book.sold} cuốn</span>
                <span>Lượt xem: {book.views}</span>
              </div>

              <button
                className={`btn btn-large ${
                  book.countInStock > 0 ? "btn-primary" : "btn-disabled"
                }`}
                disabled={book.countInStock === 0}
              >
                {book.countInStock > 0 ? <><FaShoppingCart /> Thêm vào giỏ hàng</> : "Hết hàng"}
              </button>
            </div>
          </div>

          <div className="description-section">
            <h2>Mô tả chi tiết</h2>
            <div className="description">
              {book.description}
            </div>
          </div>

          {book.reviews && book.reviews.length > 0 && (
            <div className="reviews-section">
              <h2>Đánh giá ({book.reviews.length})</h2>
              <div className="reviews-list">
                {book.reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <span className="review-name">{review.name}</span>
                      <span className="review-rating">
                        {"⭐".repeat(review.rating)}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
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

export default BookDetail;
