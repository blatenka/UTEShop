import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../redux/slices/cartSlice";
import { createNewOrder } from "../redux/slices/orderSlice";
import "../styles/Cart.css";
import { Helmet } from "react-helmet";
import { FaTrash, FaShoppingCart, FaMoneyBill, FaTruck } from "react-icons/fa";

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.orders);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    address: "",
    city: "",
    phone: "",
  });
  const [shippingPrice] = useState(30000); // Fixed shipping cost
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [showCheckout, setShowCheckout] = useState(false);
  const [error, setError] = useState("");

  const handleQuantityChange = (productId, newQty) => {
    if (newQty <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, qty: newQty }));
    }
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!user) {
      setError("Vui lòng đăng nhập để tiếp tục");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Giỏ hàng rỗng");
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    // Prepare order data
    const orderData = {
      orderItems: cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: totalPrice,
      shippingPrice,
      totalPrice: totalPrice + shippingPrice,
    };

    try {
      const result = await dispatch(createNewOrder(orderData));
      if (result.type === createNewOrder.fulfilled.type) {
        dispatch(clearCart());
        setShowCheckout(false);
        alert("Đặt hàng thành công! Redirecting to orders...");
        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      }
    } catch (err) {
      setError("Lỗi đặt hàng. Vui lòng thử lại.");
      console.error(err);
    }
  };

  if (cartItems.length === 0 && !showCheckout) {
    return (
      <div className="cart-container">
        <Helmet>
          <title>Giỏ hàng - UTEShop</title>
        </Helmet>
        <nav className="navbar">
          <div className="navbar-container">
            <Link to="/" className="navbar-brand">
              🛒 UTEShop
            </Link>
            <div className="navbar-menu">
              {user ? (
                <>
                  <span className="user-name">{user.name}</span>
                  <Link to="/profile" className="nav-btn btn-secondary">
                    Hồ sơ
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

        <div className="cart-empty">
          <div className="empty-illustration">🛒</div>
          <h2>Giỏ hàng của bạn trống</h2>
          <p>Hãy thêm một số sách yêu thích để tiếp tục</p>
          <Link to="/" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <Helmet>
        <title>Giỏ hàng - UTEShop</title>
      </Helmet>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop
          </Link>
          <div className="navbar-menu">
            {user ? (
              <>
                <span className="user-name">{user.name}</span>
                <Link to="/profile" className="nav-btn btn-secondary">
                  Hồ sơ
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

      <div className="cart-content">
        <div className="container">
          {error && <div className="error-message">{error}</div>}

          {!showCheckout ? (
            <>
              <h1 className="cart-title">Giỏ hàng</h1>

              <div className="cart-items-section">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Sách</th>
                      <th>Giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.product} className="cart-item">
                        <td className="item-info">
                          <img src={item.image} alt={item.title} className="item-image" />
                          <div className="item-details">
                            <h4>{item.title}</h4>
                            <p className="product-id">ID: {item.product}</p>
                          </div>
                        </td>
                        <td className="item-price">
                          {(item.price).toLocaleString("vi-VN")} đ
                        </td>
                        <td className="item-quantity">
                          <div className="qty-controls">
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.product, item.qty - 1)}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                handleQuantityChange(item.product, val);
                              }}
                              className="qty-input"
                            />
                            <button
                              className="qty-btn"
                              onClick={() => handleQuantityChange(item.product, item.qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="item-total">
                          {(item.price * item.qty).toLocaleString("vi-VN")} đ
                        </td>
                        <td className="item-action">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveItem(item.product)}
                          >
                            <FaTrash /> Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Cart Summary */}
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Tổng tiền hàng:</span>
                    <span className="summary-value">{totalPrice.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span className="summary-value">30,000 đ</span>
                  </div>
                  <div className="summary-row total">
                    <span>Tổng cộng:</span>
                    <span className="summary-value">{(totalPrice + 30000).toLocaleString("vi-VN")} đ</span>
                  </div>

                  <div className="cart-actions">
                    <Link to="/" className="btn btn-secondary btn-block">
                      ← Tiếp tục mua sắm
                    </Link>
                    <button
                      className="btn btn-primary btn-block"
                      onClick={() => setShowCheckout(true)}
                    >
                      <FaMoneyBill /> Tiến hành thanh toán
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Checkout Form */
            <div className="checkout-section">
              <h1 className="checkout-title">Thông tin giao hàng</h1>

              <div className="checkout-grid">
                <div className="checkout-form">
                  <form onSubmit={handleCheckout}>
                    <div className="form-group">
                      <label htmlFor="fullName">Tên người nhận</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange}
                        placeholder="Nhập tên người nhận"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        placeholder="Nhập số điện thoại"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="address">Địa chỉ</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleAddressChange}
                        placeholder="Nhập địa chỉ giao hàng"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="city">Thành phố</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Nhập thành phố"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="paymentMethod">Phương thức thanh toán</label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                        <option value="CARD">Thẻ tín dụng</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCheckout(false)}
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Order Summary */}
                <div className="checkout-summary">
                  <h3>Tóm tắt đơn hàng</h3>
                  <div className="summary-items">
                    {cartItems.map((item) => (
                      <div key={item.product} className="summary-item">
                        <span>
                          {item.title} x {item.qty}
                        </span>
                        <span>{(item.price * item.qty).toLocaleString("vi-VN")} đ</span>
                      </div>
                    ))}
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row">
                    <span>Tổng tiền hàng:</span>
                    <span>{totalPrice.toLocaleString("vi-VN")} đ</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển:</span>
                    <span>30,000 đ</span>
                  </div>
                  <div className="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>{(totalPrice + 30000).toLocaleString("vi-VN")} đ</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Cart;
