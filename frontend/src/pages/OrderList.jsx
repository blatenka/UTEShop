import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders, confirmReceived, cancelOrderAsync, clearError } from "../redux/slices/orderSlice";
import ConfirmDialog from "../components/ConfirmDialog";
import { showToast } from "../utils/toast";
import "../styles/OrderList.css";
import { Helmet } from "react-helmet";
import { FaBox, FaCheckCircle, FaTimes, FaTruck } from "react-icons/fa";

const getStatusLabel = (status) => {
  const statusMap = {
    1: { label: "Chờ xác nhận", color: "#ffc107" },
    2: { label: "Đã xác nhận", color: "#17a2b8" },
    3: { label: "Đang chuẩn bị", color: "#007bff" },
    4: { label: "Đang giao hàng", color: "#e83e8c" },
    5: { label: "Giao thành công", color: "#28a745" },
    6: { label: "Đã hủy", color: "#dc3545" },
  };
  return statusMap[status] || { label: "Không xác định", color: "#999" };
};

function OrderList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { userOrders, loading, error } = useSelector((state) => state.orders);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    dispatch(fetchUserOrders());
  }, [user, navigate, dispatch]);

  const handleConfirmReceived = (orderId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận nhận hàng",
      message: "Bạn xác nhận đã nhận được hàng? Sau khi xác nhận, đơn hàng sẽ được hoàn tất.",
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await dispatch(confirmReceived(orderId)).unwrap();
          showToast.success("Cảm ơn bạn đã mua hàng! 🙏");
          setTimeout(() => {
            showToast.info("Vui lòng để lại bình luận để cải thiện dịch vụ của chúng tôi.");
          }, 500);
          dispatch(fetchUserOrders());
        } catch (error) {
          showToast.error(error || "Lỗi xác nhận nhận hàng");
        }
      },
    });
  };

  const handleCancelOrder = (orderId) => {
    if (!cancelReason.trim()) {
      showToast.error("Vui lòng nhập lý do hủy");
      return;
    }
    dispatch(cancelOrderAsync({ orderId, reason: cancelReason })).then(() => {
      setSelectedOrder(null);
      setCancelReason("");
      dispatch(fetchUserOrders());
      showToast.success("Hủy đơn hàng thành công!");
    });
  };

  const canCancelOrder = (order) => {
    // Can cancel if status is 1 (new) or 2 (confirmed, within 30 mins)
    return [1, 2, 3].includes(order.status);
  };

  const canConfirmReceived = (order) => {
    // Can confirm only if status is 4 (in delivery)
    return order.status === 4;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="order-list-container">
      <Helmet>
        <title>Đơn hàng của tôi - UTEShop</title>
      </Helmet>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop
          </Link>
          <div className="navbar-menu">
            <span className="user-name">{user?.name}</span>
            <Link to="/profile" className="nav-btn btn-secondary">
              Hồ sơ
            </Link>
          </div>
        </div>
      </nav>

      <div className="order-content">
        <div className="container">
          <h1 className="page-title">Đơn hàng của tôi</h1>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => dispatch(clearError())} className="close-btn">×</button>
            </div>
          )}

          {loading && <div className="loading">Đang tải đơn hàng...</div>}

          {!loading && userOrders.length === 0 && (
            <div className="empty-orders">
              <div className="empty-icon">📦</div>
              <p>Bạn chưa có đơn hàng nào</p>
              <Link to="/" className="btn btn-primary">
                Tiếp tục mua sắm
              </Link>
            </div>
          )}

          {!loading && userOrders.length > 0 && (
            <div className="orders-list">
              {userOrders.map((order) => {
                const statusInfo = getStatusLabel(order.status);
                const isExpanded = expandedOrder === order._id;

                return (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <div className="order-header-info">
                        <div className="order-id">
                          <span className="label">Mã đơn:</span>
                          <span className="value">{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="order-date">
                          <span className="label">Ngày đặt:</span>
                          <span className="value">
                            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                      <div className="order-status">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: statusInfo.color }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Order Summary Preview */}
                    <div className="order-summary">
                      <div className="summary-items-preview">
                        {order.orderItems.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="item-preview">
                            <img src={item.image} alt={item.title} />
                            <div className="preview-info">
                              <p className="preview-title">{item.title}</p>
                              <p className="preview-qty">SL: {item.qty}</p>
                            </div>
                          </div>
                        ))}
                        {order.orderItems.length > 2 && (
                          <div className="more-items">+{order.orderItems.length - 2}</div>
                        )}
                      </div>
                      <div className="summary-price">
                        <span className="label">Tổng cộng:</span>
                        <span className="price">
                          {order.totalPrice.toLocaleString("vi-VN")} đ
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      className="expand-btn"
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    >
                      {isExpanded ? "▼ Ẩn chi tiết" : "▶ Xem chi tiết"}
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="order-details">
                        <div className="details-section">
                          <h4>Sản phẩm</h4>
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Sách</th>
                                <th>Giá</th>
                                <th>SL</th>
                                <th>Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.orderItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td>
                                    <Link to={`/books/${item.product}`} className="book-link">
                                      {item.title}
                                    </Link>
                                  </td>
                                  <td>{item.price.toLocaleString("vi-VN")} đ</td>
                                  <td>{item.qty}</td>
                                  <td>
                                    {(item.price * item.qty).toLocaleString("vi-VN")} đ
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="details-section">
                          <h4>Thông tin giao hàng</h4>
                          <div className="shipping-info">
                            <p>
                              <strong>Người nhận:</strong> {order.shippingAddress.fullName}
                            </p>
                            <p>
                              <strong>Địa chỉ:</strong> {order.shippingAddress.address}
                            </p>
                            <p>
                              <strong>Thành phố:</strong> {order.shippingAddress.city}
                            </p>
                            <p>
                              <strong>SĐT:</strong> {order.shippingAddress.phone}
                            </p>
                          </div>
                        </div>

                        <div className="details-section">
                          <h4>Chi tiết thanh toán</h4>
                          <div className="payment-info">
                            <div className="info-row">
                              <span>Tiền hàng:</span>
                              <span>{order.itemsPrice.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="info-row">
                              <span>Phí vận chuyển:</span>
                              <span>{order.shippingPrice.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="info-row total">
                              <span>Tổng cộng:</span>
                              <span>{order.totalPrice.toLocaleString("vi-VN")} đ</span>
                            </div>
                            <div className="info-row">
                              <span>Phương thức thanh toán:</span>
                              <span>{order.paymentMethod}</span>
                            </div>
                            <div className="info-row">
                              <span>Trạng thái thanh toán:</span>
                              <span>
                                {order.isPaid ? (
                                  <span className="badge-paid">Đã thanh toán</span>
                                ) : (
                                  <span className="badge-unpaid">Chưa thanh toán</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="order-actions">
                          {canConfirmReceived(order) && (
                            <button
                              className="btn btn-success"
                              onClick={() => handleConfirmReceived(order._id)}
                            >
                              <FaCheckCircle /> Xác nhận đã nhận hàng
                            </button>
                          )}

                          {canCancelOrder(order) && (
                            <button
                              className="btn btn-danger"
                              onClick={() => setSelectedOrder(order._id)}
                            >
                              <FaTimes /> Hủy đơn hàng
                            </button>
                          )}
                        </div>

                        {/* Cancel Reason Form */}
                        {selectedOrder === order._id && canCancelOrder(order) && (
                          <div className="cancel-form">
                            <label>Lý do hủy:</label>
                            <textarea
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              placeholder="Nhập lý do hủy đơn hàng..."
                              rows="3"
                            ></textarea>
                            <div className="form-buttons">
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setSelectedOrder(null);
                                  setCancelReason("");
                                }}
                              >
                                Không
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => handleCancelOrder(order._id)}
                              >
                                Xác nhận hủy
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous={false}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}

export default OrderList;
