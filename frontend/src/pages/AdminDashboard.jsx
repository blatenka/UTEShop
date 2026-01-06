import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrder, clearError } from "../redux/slices/orderSlice";
import { 
  getAllBooks, 
  getAllUsers, 
  createBook as apiCreateBook,
  updateBook as apiUpdateBook,
  deleteBook as apiDeleteBook,
  getCategories
} from "../redux/axiosInstance";
import BookForm from "../components/BookForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { showToast } from "../utils/toast";
import "../styles/AdminDashboard.css";
import { Helmet } from "react-helmet";
import { FaBox, FaUsers, FaBook, FaChartBar, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

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

function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, loading: ordersLoading, error } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("orders");
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [loadingBookAction, setLoadingBookAction] = useState(false);

  // Confirm Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDangerous: false,
  });

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  // Load data based on active tab
  useEffect(() => {
  if (!user || user.role !== "admin") return;

  if (activeTab === "orders") {
    dispatch(fetchAllOrders());
  }

  if (activeTab === "users") {
    loadUsers();
  }

  if (activeTab === "books") {
    loadBooks();
  }
}, [activeTab, user]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllUsers();
      setUsers(Array.isArray(response) ? response : response.users || []);
      showToast.success("Tải danh sách người dùng thành công");
    } catch (error) {
      console.error("Error loading users:", error);
      showToast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadBooks = async () => {
    setLoadingBooks(true);
    try {
      const response = await getAllBooks();
      setBooks(response.books || response.data?.books || []);
      showToast.success("Tải danh sách sách thành công");
    } catch (error) {
      console.error("Error loading books:", error);
      showToast.error("Lỗi tải danh sách sách");
    } finally {
      setLoadingBooks(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleAddBook = () => {
    setEditingBook(null);
    loadCategories();
    setShowBookForm(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    loadCategories();
    setShowBookForm(true);
  };

  const handleBookFormSubmit = async (formData, bookId) => {
    setLoadingBookAction(true);
    try {
      if (bookId) {
        // Update existing book
        await apiUpdateBook(bookId, formData);
        showToast.success("Cập nhật sách thành công");
      } else {
        // Create new book
        await apiCreateBook(formData);
        showToast.success("Thêm sách mới thành công");
      }
      loadBooks();
    } catch (error) {
      console.error("Error saving book:", error);
      showToast.error(bookId ? "Lỗi cập nhật sách" : "Lỗi thêm sách");
    } finally {
      setLoadingBookAction(false);
    }
  };

  const handleDeleteBook = async (bookId, bookTitle) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa sách",
      message: `Bạn có chắc chắn muốn xóa sách "${bookTitle}"? Hành động này không thể được hoàn tác.`,
      isDangerous: true,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        setLoadingBookAction(true);
        try {
          await apiDeleteBook(bookId);
          showToast.success("Xóa sách thành công");
          loadBooks();
        } catch (error) {
          console.error("Error deleting book:", error);
          showToast.error("Lỗi xóa sách");
        } finally {
          setLoadingBookAction(false);
        }
      },
    });
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    setConfirmDialog({
      isOpen: true,
      title: "Cập nhật trạng thái đơn hàng",
      message: "Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này?",
      isDangerous: false,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          await dispatch(updateOrder({ orderId, status }));
          setSelectedOrderForUpdate(null);
          setNewStatus(null);
          dispatch(fetchAllOrders());
          showToast.success("Cập nhật trạng thái đơn hàng thành công");
        } catch (error) {
          showToast.error("Lỗi cập nhật trạng thái đơn hàng");
        }
      },
    });
  };

  const handleDeleteUser = async (userId, userName) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa người dùng",
      message: `Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể được hoàn tác.`,
      isDangerous: true,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        try {
          const response = await fetch(`/api/users/${userId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
          });
          
          if (!response.ok) {
            throw new Error("Lỗi xóa người dùng");
          }
          
          loadUsers();
          showToast.success("Xóa người dùng thành công");
        } catch (error) {
          console.error("Error deleting user:", error);
          showToast.error("Lỗi xóa người dùng");
        }
      },
    });
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard-container">
      <Helmet>
        <title>Admin Dashboard - UTEShop</title>
      </Helmet>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop Admin
          </Link>
          <div className="navbar-menu">
            <span className="user-name">👑 {user?.name}</span>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/");
              }}
              className="nav-btn btn-secondary"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <div className="container">
          <h1 className="admin-title">Bảng điều khiển Admin</h1>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => dispatch(clearError())} className="close-btn">
                ×
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              <FaBox /> Quản lý hoá đơn
            </button>
            <button
              className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <FaUsers /> Quản lý người dùng
            </button>
            <button
              className={`tab-btn ${activeTab === "books" ? "active" : ""}`}
              onClick={() => setActiveTab("books")}
            >
              <FaBook /> Quản lý sách
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="tab-panel">
                <h2>Danh sách hoá đơn</h2>
                {ordersLoading && <div className="loading">Đang tải hoá đơn...</div>}
                {!ordersLoading && orders.length === 0 && (
                  <div className="empty-state">Không có hoá đơn nào</div>
                )}
                {!ordersLoading && orders.length > 0 && (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                          <th>Ngày đặt</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const statusInfo = getStatusLabel(order.status);
                          return (
                            <tr key={order._id}>
                              <td className="code">
                                {order._id.slice(-8).toUpperCase()}
                              </td>
                              <td>{order.user?.name || "N/A"}</td>
                              <td className="price">
                                {order.totalPrice.toLocaleString("vi-VN")} đ
                              </td>
                              <td>
                                <span
                                  className="status-badge"
                                  style={{ backgroundColor: statusInfo.color }}
                                >
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button
                                    className="btn-view"
                                    onClick={() =>
                                      setSelectedOrderForUpdate(
                                        selectedOrderForUpdate === order._id
                                          ? null
                                          : order._id
                                      )
                                    }
                                  >
                                    {selectedOrderForUpdate === order._id
                                      ? "▼"
                                      : "▶"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Order Details */}
                    {selectedOrderForUpdate && (
                      <div className="order-detail-panel">
                        {orders.map((order) => {
                          if (order._id !== selectedOrderForUpdate) return null;
                          const statusInfo = getStatusLabel(order.status);

                          return (
                            <div key={order._id} className="detail-content">
                              <h3>Chi tiết hoá đơn #{order._id.slice(-8).toUpperCase()}</h3>

                              {/* Shipping Address */}
                              <div className="detail-section">
                                <h4>Thông tin giao hàng</h4>
                                <p>
                                  <strong>Người nhận:</strong>{" "}
                                  {order.shippingAddress.fullName}
                                </p>
                                <p>
                                  <strong>Địa chỉ:</strong>{" "}
                                  {order.shippingAddress.address}
                                </p>
                                <p>
                                  <strong>Thành phố:</strong>{" "}
                                  {order.shippingAddress.city}
                                </p>
                                <p>
                                  <strong>SĐT:</strong>{" "}
                                  {order.shippingAddress.phone}
                                </p>
                              </div>

                              {/* Order Items */}
                              <div className="detail-section">
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
                                        <td>
                                          {item.price.toLocaleString(
                                            "vi-VN"
                                          )}{" "}
                                          đ
                                        </td>
                                        <td>{item.qty}</td>
                                        <td>
                                          {(item.price * item.qty).toLocaleString(
                                            "vi-VN"
                                          )}{" "}
                                          đ
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Status Update */}
                              <div className="detail-section">
                                <h4>Cập nhật trạng thái</h4>
                                <div className="status-update">
                                  <p>
                                    <strong>Trạng thái hiện tại:</strong>{" "}
                                    <span
                                      className="status-badge"
                                      style={{ backgroundColor: statusInfo.color }}
                                    >
                                      {statusInfo.label}
                                    </span>
                                  </p>
                                  <div className="status-flow">
                                    {order.status < 6 && order.status !== 5 && (
                                      <>
                                        {order.status < 2 && (
                                          <button
                                            className="btn btn-info"
                                            onClick={() =>
                                              handleUpdateOrderStatus(order._id, 2)
                                            }
                                          >
                                            → Xác nhận đơn (Status 2)
                                          </button>
                                        )}
                                        {order.status < 3 && order.status >= 2 && (
                                          <button
                                            className="btn btn-info"
                                            onClick={() =>
                                              handleUpdateOrderStatus(order._id, 3)
                                            }
                                          >
                                            → Chuẩn bị hàng (Status 3)
                                          </button>
                                        )}
                                        {order.status < 4 && order.status >= 3 && (
                                          <button
                                            className="btn btn-warning"
                                            onClick={() =>
                                              handleUpdateOrderStatus(order._id, 4)
                                            }
                                          >
                                            → Giao cho shipper (Status 4)
                                          </button>
                                        )}
                                      </>
                                    )}
                                    {order.status === 5 && (
                                      <p className="success-text">
                                        ✓ Đơn hàng đã hoàn tất
                                      </p>
                                    )}
                                    {order.status === 6 && (
                                      <p className="danger-text">
                                        ✕ Đơn hàng đã bị hủy
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Payment Status */}
                              <div className="detail-section">
                                <h4>Thanh toán</h4>
                                <p>
                                  <strong>Phương thức:</strong>{" "}
                                  {order.paymentMethod}
                                </p>
                                <p>
                                  <strong>Trạng thái:</strong>{" "}
                                  {order.isPaid ? (
                                    <span className="badge-paid">
                                      Đã thanh toán
                                    </span>
                                  ) : (
                                    <span className="badge-unpaid">
                                      Chưa thanh toán
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="tab-panel">
                <h2>Danh sách người dùng</h2>
                {loadingUsers && <div className="loading">Đang tải người dùng...</div>}
                {!loadingUsers && users.length === 0 && (
                  <div className="empty-state">Không có người dùng nào</div>
                )}
                {!loadingUsers && users.length > 0 && (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên</th>
                          <th>Email</th>
                          <th>Vai trò</th>
                          <th>Ngày tạo</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u._id}>
                            <td className="code">{u._id.slice(-8)}</td>
                            <td>{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              {u.role === "admin" ? (
                                <span className="badge-admin">👑 Admin</span>
                              ) : (
                                <span className="badge-user">👤 User</span>
                              )}
                            </td>
                            <td>
                              {new Date(u.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </td>
                            <td>
                              {u.role !== "admin" && (
                                <button
                                  className="btn-delete"
                                  onClick={() => handleDeleteUser(u._id, u.name)}
                                  title="Xóa người dùng"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Books Tab */}
            {activeTab === "books" && (
              <div className="tab-panel">
                <div className="tab-header">
                  <h2>Danh sách sách</h2>
                  <button 
                    className="btn btn-primary btn-add"
                    onClick={handleAddBook}
                  >
                    <FaPlus /> Thêm sách mới
                  </button>
                </div>

                {loadingBooks && <div className="loading">Đang tải sách...</div>}
                {!loadingBooks && books.length === 0 && (
                  <div className="empty-state">Không có sách nào</div>
                )}
                {!loadingBooks && books.length > 0 && (
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Hình ảnh</th>
                          <th>Tiêu đề</th>
                          <th>Tác giả</th>
                          <th>Giá</th>
                          <th>Tồn kho</th>
                          <th>Đã bán</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book) => (
                          <tr key={book._id}>
                            <td className="book-image">
                              <img
                                src={book.image}
                                alt={book.title}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/60x90?text=No+Image";
                                }}
                              />
                            </td>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td className="price">
                              {book.price.toLocaleString("vi-VN")} đ
                            </td>
                            <td>
                              <span
                                className={`stock-badge ${
                                  book.countInStock > 0
                                    ? "in-stock"
                                    : "out-of-stock"
                                }`}
                              >
                                {book.countInStock}
                              </span>
                            </td>
                            <td>{book.sold || 0}</td>
                            <td className="actions">
                              <button 
                                className="btn-edit" 
                                title="Chỉnh sửa"
                                onClick={() => handleEditBook(book)}
                                disabled={loadingBookAction}
                              >
                                <FaEdit /> Sửa
                              </button>
                              <button 
                                className="btn-delete" 
                                title="Xóa"
                                onClick={() => handleDeleteBook(book._id, book.title)}
                                disabled={loadingBookAction}
                              >
                                <FaTrash /> Xóa
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Form Modal */}
      {showBookForm && (
        <BookForm
          onClose={() => setShowBookForm(false)}
          onSubmit={handleBookFormSubmit}
          initialData={editingBook}
          categories={categories}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDangerous={confirmDialog.isDangerous}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}

export default AdminDashboard;
