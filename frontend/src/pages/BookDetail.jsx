import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getBookById, getRelatedBooks } from "../api";
import { createBookReview, addToWishlist, removeFromWishlist, getMyWishlist } from "../redux/axiosInstance";
import { addToCart } from "../redux/slices/cartSlice";
import { showToast } from "../utils/toast";
import ProductCard from "../components/ProductCard";
import "../styles/BookDetail.css";
import { Helmet } from "react-helmet";
import { FaArrowLeft, FaShoppingCart, FaStar, FaUser, FaBox, FaCrown, FaHeart } from "react-icons/fa";

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  useEffect(() => {
    if (user) {
      checkWishlistStatus();
    }
  }, [id, user]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const data = await getBookById(id);
      setBook(data);
      setError(null);
      
      // Fetch related books
      fetchRelatedBooks();
    } catch (err) {
      setError("Không thể tải chi tiết sách. Vui lòng thử lại.");
      showToast.error("Không thể tải chi tiết sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBooks = async () => {
    try {
      setLoadingRelated(true);
      const data = await getRelatedBooks(id);
      setRelatedBooks(data || []);
    } catch (err) {
      console.error("Lỗi tải sách liên quan:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const wishlist = await getMyWishlist();
      const inWishlist = wishlist.some(item => item._id === id);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast.warning("Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      navigate("/login");
      return;
    }

    try {
      setWishlistLoading(true);
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
        showToast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
        showToast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showToast.error("Lỗi cập nhật danh sách yêu thích");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showToast.warning("Vui lòng đăng nhập để bình luận");
      navigate("/login");
      return;
    }

    if (!comment.trim()) {
      setReviewError("Vui lòng nhập nội dung bình luận");
      showToast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      setReviewLoading(true);
      setReviewError("");
      
      await createBookReview(id, {
        rating: Number(rating),
        comment: comment.trim(),
      });

      setReviewSuccess("Cảm ơn bạn đã bình luận! Bình luận của bạn sẽ được hiển thị sau khi xác nhận.");
      showToast.success("Cảm ơn bạn đã bình luận! Bình luận sẽ được hiển thị sau khi xác nhận.");
      setComment("");
      setRating(5);

      // Reload book details to show new review
      setTimeout(() => {
        fetchBookDetails();
        setReviewSuccess("");
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setReviewError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (book.countInStock === 0) {
      showToast.warning("Sách này đã hết hàng");
      return;
    }

    dispatch(addToCart({
      product: book._id,
      title: book.title,
      qty: quantity,
      price: book.price,
      image: book.image,
    }));

    setQuantity(1);
    showToast.success("Đã thêm vào giỏ hàng!");
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

              <div className="quantity-section">
                <label>Số lượng:</label>
                <input
                  type="number"
                  min="1"
                  max={book.countInStock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input"
                />
              </div>

              <button
                className={`btn btn-large ${
                  book.countInStock > 0 ? "btn-primary" : "btn-disabled"
                }`}
                disabled={book.countInStock === 0}
                onClick={handleAddToCart}
              >
                {book.countInStock > 0 ? <><FaShoppingCart /> Thêm vào giỏ hàng</> : "Hết hàng"}
              </button>

              <button
                className={`btn btn-wishlist ${isInWishlist ? "in-wishlist" : ""}`}
                disabled={wishlistLoading}
                onClick={handleToggleWishlist}
                title={isInWishlist ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
              >
                <FaHeart className={isInWishlist ? "filled" : ""} /> 
                {isInWishlist ? "Đã thêm yêu thích" : "Thêm yêu thích"}
              </button>
            </div>
          </div>

          <div className="description-section">
            <h2>Mô tả chi tiết</h2>
            <div className="description">
              {book.description}
            </div>
          </div>

          {/* Review Form */}
          <div className="review-form-section">
            <h2>Chia sẻ bình luận của bạn</h2>
            <form onSubmit={handleSubmitReview} className="review-form">
              {reviewError && <div className="error-message">{reviewError}</div>}
              {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}

              <div className="form-group">
                <label>Đánh giá:</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= (hoverRating || rating) ? "active" : ""}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <FaStar />
                    </button>
                  ))}
                  <span className="rating-text">
                    {hoverRating || rating} / 5
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Bình luận:</label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về cuốn sách này..."
                  rows="5"
                  className="comment-textarea"
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={reviewLoading || !comment.trim()}
              >
                {reviewLoading ? "Đang gửi..." : "Gửi bình luận"}
              </button>

              {!user && (
                <p className="login-prompt">
                  <Link to="/login">Đăng nhập</Link> để bình luận
                </p>
              )}
            </form>
          </div>

          {/* Reviews List */}
          {book.reviews && book.reviews.length > 0 && (
            <div className="reviews-section">
              <h2>Bình luận ({book.reviews.length})</h2>
              <div className="reviews-stats">
                <div className="avg-rating">
                  <div className="avg-score">{book.rating?.toFixed(1) || 0}</div>
                  <div className="avg-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={star <= Math.round(book.rating) ? "star-fill" : "star-empty"}
                      />
                    ))}
                  </div>
                  <div className="avg-text">dựa trên {book.reviews.length} bình luận</div>
                </div>
              </div>

              <div className="reviews-list">
                {book.reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <FaUser />
                        </div>
                        <div className="reviewer-details">
                          <h4 className="reviewer-name">{review.name}</h4>
                          <div className="review-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={star <= review.rating ? "star-fill" : "star-empty"}
                              />
                            ))}
                            <span className="rating-value">({review.rating}/5)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <div className="related-books-section">
          <h2>📚 Sách liên quan</h2>
          <p>Những sách khác cùng thể loại bạn có thể quan tâm</p>
          <div className="related-books-grid">
            {relatedBooks.map((book) => (
              <ProductCard key={book._id} book={book} />
            ))}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>&copy; 2026 UTEBookShop - 22110223 - Bùi Lê Anh Tân</p>
      </footer>
    </div>
  );
}

export default BookDetail;
