import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { 
  getUserProfile, 
  updateUserProfile, 
  updateUserAvatar, 
  changePassword 
} from "../redux/axiosInstance";
import { showToast } from "../utils/toast";
import "../styles/Profile.css";
import { Helmet } from "react-helmet";
import { FaUser, FaSignOutAlt, FaEdit, FaCopy, FaEye, FaEyeSlash } from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchProfileData();
  }, [token, navigate]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setProfileData(data.user);
      setFormData({
        name: data.user.name,
        phone: data.user.phone || "",
        address: data.user.address || "",
        city: data.user.city || "",
      });
    } catch (error) {
      console.error("Fetch profile error:", error);
      // Nếu 401, token không hợp lệ - redirect về home
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate("/");
      } else {
        showToast.error("Lỗi tải thông tin hồ sơ");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(formData);
      showToast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
      fetchProfileData();
    } catch (error) {
      showToast.error(error.response?.data?.message || "Lỗi cập nhật thông tin");
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatarFile) {
      showToast.warning("Vui lòng chọn ảnh");
      return;
    }

    try {
      setAvatarUploading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", avatarFile);

      await updateUserAvatar(formDataToSend);
      showToast.success("Cập nhật avatar thành công!");
      setAvatarFile(null);
      setAvatarPreview(null);
      fetchProfileData();
    } catch (error) {
      showToast.error(error.response?.data?.message || "Lỗi upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast.error("Vui lòng điền đầy đủ các trường");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast.error("Mật khẩu mới không khớp");
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      showToast.success("Thay đổi mật khẩu thành công!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ old: false, new: false, confirm: false });
    } catch (error) {
      showToast.error(error.response?.data?.message || "Lỗi thay đổi mật khẩu");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast.info("Đã sao chép!");
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Đang tải thông tin...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="error-message">Không thể tải thông tin hồ sơ</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Helmet>
        <title>Hồ sơ - UTEShop</title>
      </Helmet>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop
          </Link>

          <div className="navbar-menu">
            <span className="user-name">{profileData.name}</span>
            <button onClick={handleLogout} className="nav-btn btn-secondary">
              <FaSignOutAlt /> Đăng xuất
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Container */}
      <div className="profile-container">
        <div className="profile-wrapper">
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="avatar-section">
              <div className="avatar-display">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" />
                ) : profileData.avatar ? (
                  <img src={profileData.avatar} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {profileData.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </div>
              <h2 className="profile-name">{profileData.name}</h2>
              <p className="profile-email">{profileData.email}</p>
              <p className="profile-role">
                {profileData.role === "admin" ? "👑 Quản trị viên" : "👤 Khách hàng"}
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="profile-tabs">
              <button
                className={`tab-btn ${activeTab === "info" ? "active" : ""}`}
                onClick={() => setActiveTab("info")}
              >
                <FaUser /> Thông tin
              </button>
              <button
                className={`tab-btn ${activeTab === "avatar" ? "active" : ""}`}
                onClick={() => setActiveTab("avatar")}
              >
                Ảnh đại diện
              </button>
              <button
                className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                Mật khẩu
              </button>
              <button
                className={`tab-btn ${activeTab === "wishlist" ? "active" : ""}`}
                onClick={() => navigate("/wishlist")}
              >
                ♥ Yêu thích
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-content">
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Thông tin cá nhân</h2>
                  <button
                    className="btn btn-edit"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <FaEdit /> {isEditing ? "Hủy" : "Chỉnh sửa"}
                  </button>
                </div>

                {isEditing ? (
                  <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div className="form-group">
                      <label>Tên</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="disabled-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>

                    <div className="form-group">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    <div className="form-group">
                      <label>Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Nhập thành phố"
                      />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block">
                      Lưu thay đổi
                    </button>
                  </form>
                ) : (
                  <div className="profile-info-display">
                    <div className="info-item">
                      <span className="label">Tên:</span>
                      <span className="value">{profileData.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value email-display">
                        {profileData.email}
                        <button
                          className="copy-btn"
                          onClick={() => copyToClipboard(profileData.email)}
                        >
                          <FaCopy />
                        </button>
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{profileData.phone || "Chưa cập nhật"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Địa chỉ:</span>
                      <span className="value">{profileData.address || "Chưa cập nhật"}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Thành phố:</span>
                      <span className="value">{profileData.city || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Avatar Tab */}
            {activeTab === "avatar" && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Thay đổi ảnh đại diện</h2>
                </div>

                <form onSubmit={handleUpdateAvatar} className="avatar-form">
                  <div className="avatar-upload">
                    <label htmlFor="avatar-input" className="upload-label">
                      <div className="upload-placeholder">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" />
                        ) : (
                          <>
                            <div className="upload-icon">📸</div>
                            <p>Chọn ảnh từ máy tính</p>
                          </>
                        )}
                      </div>
                      <input
                        id="avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>

                  {avatarFile && (
                    <div className="upload-actions">
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={avatarUploading}
                      >
                        {avatarUploading ? "⏳ Đang xử lý..." : "Tải lên"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        }}
                        disabled={avatarUploading}
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === "password" && (
              <div className="tab-content">
                <div className="content-header">
                  <h2>Thay đổi mật khẩu</h2>
                </div>

                <form onSubmit={handleChangePassword} className="profile-form">
                  <div className="form-group">
                    <label>Mật khẩu cũ</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.old ? "text" : "password"}
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu cũ"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, old: !showPasswords.old })
                        }
                      >
                        {showPasswords.old ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu mới</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                      >
                        {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <div className="password-input">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Xác nhận mật khẩu mới"
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                      >
                        {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-block">
                    Thay đổi mật khẩu
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
