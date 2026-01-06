import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getMyWishlist, removeFromWishlist } from "../redux/axiosInstance";
import { showToast } from "../utils/toast";
import "../styles/Wishlist.css";
import { Helmet } from "react-helmet";
import { FaArrowLeft, FaTrash, FaShoppingCart, FaHeart } from "react-icons/fa";

function Wishlist() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadWishlist();
  }, [user, navigate]);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const items = await getMyWishlist();
      setWishlistItems(items || []);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      showToast.error("Không thể tải danh sách yêu thích");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId, bookTitle) => {
    if (window.confirm(`Xóa "${bookTitle}" khỏi danh sách yêu thích?`)) {
      try {
        setRemoving(true);
        await removeFromWishlist(bookId);
        setWishlistItems(wishlistItems.filter(item => item._id !== bookId));
        showToast.success("Đã xóa khỏi danh sách yêu thích");
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        showToast.error("Lỗi xóa khỏi danh sách yêu thích");
      } finally {
        setRemoving(false);
      }
    }
  };

  const handleAddToCart = (book) => {
    // Navigate to book detail with add to cart action
    navigate(`/books/${book._id}`);
    showToast.info("Chuyển đến chi tiết sách");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="wishlist-container">
      <Helmet>
        <title>Danh sách yêu thích - UTEShop</title>
      </Helmet>

      {/* Header */}
      <div className="wishlist-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Quay lại
        </button>
        <h1>
          <FaHeart className="heart-icon" /> Danh sách yêu thích của tôi
        </h1>
        <div className="wishlist-count">{wishlistItems.length} sách</div>
      </div>

      <div className="wishlist-content">
        {loading ? (
          <div className="loading">Đang tải danh sách yêu thích...</div>
        ) : wishlistItems.length === 0 ? (
          <div className="empty-state">
            <FaHeart className="empty-icon" />
            <p>Bạn chưa thêm sách nào vào danh sách yêu thích</p>
            <Link to="/" className="btn btn-primary">
              Khám phá sách
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistItems.map((book) => (
              <div key={book._id} className="wishlist-card">
                <div className="card-image">
                  <img
                    src={book.image}
                    alt={book.title}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150x200?text=No+Image";
                    }}
                  />
                  {book.countInStock > 0 ? (
                    <span className="stock-badge in-stock">Còn hàng</span>
                  ) : (
                    <span className="stock-badge out-of-stock">Hết hàng</span>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author || "Tác giả không rõ"}</p>
                  <p className="book-category">{book.category || "Danh mục không rõ"}</p>
                  <div className="card-footer">
                    <span className="book-price">
                      {book.price.toLocaleString("vi-VN")} đ
                    </span>
                    <div className="card-actions">
                      <button
                        className="btn-action btn-cart"
                        onClick={() => handleAddToCart(book)}
                        disabled={removing}
                        title="Xem chi tiết"
                      >
                        <FaShoppingCart /> Xem
                      </button>
                      <button
                        className="btn-action btn-remove"
                        onClick={() =>
                          handleRemoveFromWishlist(book._id, book.title)
                        }
                        disabled={removing}
                        title="Xóa khỏi danh sách yêu thích"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
