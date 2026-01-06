import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { showToast } from "../utils/toast";
import "../styles/ProductCard.css";

function ProductCard({ book, onSelectBook }) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const ref = useRef(null);
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  // Lazy load images using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  // Set image when visible
  useEffect(() => {
    if (isVisible && !imageSrc) {
      setImageSrc(book.image || "https://via.placeholder.com/200x300?text=No+Image");
    }
  }, [isVisible, imageSrc, book.image]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const discountPercent = book.originalPrice && book.price 
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;

  return (
    <div ref={ref} className="product-card">
      <Link to={`/book/${book._id}`} className="product-card-link">
        <div className="product-image">
          {isVisible ? (
            <>
              <img
                src={imageSrc}
                alt={book.title}
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x300?text=No+Image";
                }}
              />
              {discountPercent > 0 && (
                <div className="discount-badge">-{discountPercent}%</div>
              )}
              {book.countInStock === 0 && (
                <div className="out-of-stock">Hết hàng</div>
              )}
            </>
          ) : (
            <div className="image-skeleton"></div>
          )}
        </div>

        <div className="product-info">
          <h3>{book.title}</h3>
          <p className="author">Tác giả: {book.author}</p>
          
          {book.rating !== undefined && (
            <div className="rating">
              <span className="stars">
                {'⭐'.repeat(Math.floor(book.rating || 0))}
              </span>
              {book.numReviews > 0 && (
                <span className="review-count">({book.numReviews})</span>
              )}
            </div>
          )}
          
          {book.sold !== undefined && (
            <p className="sold-count">Đã bán: {book.sold}</p>
          )}

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
        className={`btn btn-add-to-cart ${book.countInStock === 0 ? "disabled" : ""}`}
        onClick={handleAddToCart}
        disabled={book.countInStock === 0}
      >
        {book.countInStock === 0 ? "Hết hàng" : "🛒 Thêm vào giỏ"}
      </button>
    </div>
  );
}

export default ProductCard;
