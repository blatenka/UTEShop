import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBooks, getHomeProducts, getCategories } from "../api";
import { addToCart } from "../redux/slices/cartSlice";
import { showToast } from "../utils/toast";
import ProductCard from "../components/ProductCard";
import "../styles/Home.css";
import { Helmet } from "react-helmet";
import { FaShoppingCart, FaCrown, FaBox, FaUser, FaSearch, FaFire, FaEye } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // Tất cả sách cho lazy loading
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [homeProducts, setHomeProducts] = useState({
    newArrivals: [],
    bestSellers: [],
    topViewed: [],
    hotDeals: []
  });
  const [loading, setLoading] = useState(true);
  const [loadingHome, setLoadingHome] = useState(true);
  const [error, setError] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const pageSize = 6; // 6 quyển 1 lần

  useEffect(() => {
    fetchHomeProducts();
    fetchAllBooks(1);
    fetchCategories();
    setIsSearching(false);
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const fetchAllBooks = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      
      const data = await getBooks(searchKeyword, page, selectedCategory);
      
      if (page === 1) {
        setAllBooks(data.books || []);
      } else {
        setAllBooks(prev => [...prev, ...(data.books || [])]);
      }
      
      setTotalPages(data.pages || 1);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError("Không thể tải danh sách sách. Vui lòng thử lại.");
      showToast.error("Không thể tải danh sách sách. Vui lòng thử lại.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchHomeProducts = async () => {
    try {
      setLoadingHome(true);
      const data = await getHomeProducts();
      setHomeProducts(data);
    } catch (err) {
      console.error("Lỗi tải sản phẩm trang chủ:", err);
    } finally {
      setLoadingHome(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setAllBooks([]);
    setCurrentPage(1);
    fetchAllBooks(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setIsSearching(true);
    setAllBooks([]);
    setCurrentPage(1);
    // Fetch ngay khi đổi danh mục
    setTimeout(() => fetchAllBooks(1), 0);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchAllBooks(currentPage + 1);
    }
  };

  const handleAddToCart = (book) => {
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
    
    setSelectedBook(null);
    setQuantity(1);
    showToast.success("Đã thêm vào giỏ hàng!");
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
            <select 
              className="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">
              <FaSearch /> Tìm kiếm
            </button>
          </form>
        </div>
      </div>

      {/* Featured Sections */}
      {!loadingHome && !isSearching &&(
        <>
          {/* Hot Deals Section */}
          {homeProducts.hotDeals.length > 0 && (
            <div className="featured-section hot-deals">
              <div className="container">
                <div className="section-header">
                  <h2><FaFire className="section-icon" /> Khuyến mãi hot</h2>
                  <p>Giảm giá tới 50% cho những sản phẩm được chọn lọc</p>
                </div>
                <div className="products-grid">
                  {homeProducts.hotDeals.map((book) => (
                    <ProductCard key={book._id} book={book} onSelectBook={setSelectedBook} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* New Arrivals Section */}
          {homeProducts.newArrivals.length > 0 && (
            <div className="featured-section new-arrivals">
              <div className="container">
                <div className="section-header">
                  <h2>✨ Sản phẩm mới nhất</h2>
                  <p>Những cuốn sách mới cập nhật hàng tuần</p>
                </div>
                <div className="products-grid">
                  {homeProducts.newArrivals.map((book) => (
                    <ProductCard key={book._id} book={book} onSelectBook={setSelectedBook} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Viewed Section */}
          {homeProducts.topViewed.length > 0 && (
            <div className="featured-section top-viewed">
              <div className="container">
                <div className="section-header">
                  <h2><FaEye className="section-icon" /> Sản phẩm xem nhiều nhất</h2>
                  <p>Những sách được yêu thích nhất bởi cộng đồng</p>
                </div>
                <div className="products-grid">
                  {homeProducts.topViewed.map((book) => (
                    <ProductCard key={book._id} book={book} onSelectBook={setSelectedBook} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Best Sellers Section */}
          {homeProducts.bestSellers.length > 0 && (
            <div className="featured-section best-sellers">
              <div className="container">
                <div className="section-header">
                  <h2>🏆 Bán chạy nhất</h2>
                  <p>Những sách được mua nhiều nhất trên hệ thống</p>
                </div>
                <div className="products-grid">
                  {homeProducts.bestSellers.map((book) => (
                    <ProductCard key={book._id} book={book} onSelectBook={setSelectedBook} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="products-section">
        <div className="container">
          <h2>📚 Tất cả sách</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Đang tải sách...</div>
          ) : allBooks.length === 0 ? (
            <div className="no-products">Không tìm thấy sách nào.</div>
          ) : (
            <>
              <div className="products-grid">
                {allBooks.map((book) => (
                  <ProductCard 
                    key={book._id} 
                    book={book}
                    onSelectBook={setSelectedBook}
                  />
                ))}
              </div>
              
              {currentPage < totalPages && (
                <div className="load-more-container">
                  <button 
                    className="btn btn-primary load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Đang tải..." : "Tải thêm sách"}
                  </button>
                </div>
              )}
            </>
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
        <p>&copy; 2026 UTEBookShop - 22110223 - Bùi Lê Anh Tân</p>
      </footer>
    </div>
  );
}

export default Home;
