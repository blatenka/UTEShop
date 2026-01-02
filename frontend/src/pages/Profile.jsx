import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import "../styles/Profile.css";

function Profile({ onLogout }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  if (loading || !user) {
    return <div className="loading">Loading...</div>;
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString();

  return (
    <div className="profile-container">
      <nav className="navbar">
        <div className="navbar-container">
          <a href="/" className="navbar-brand">
            🛒 UTEShop
          </a>
          <div className="navbar-menu">
            <a href="/" className="nav-link">Home</a>
            <button onClick={handleLogout} className="nav-btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.picture ? (
                <img src={user.picture} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="profile-title">
              <h1>{user.name || 'User'}</h1>
              <p className="profile-subtitle">{user.email}</p>
            </div>
          </div>

          <div className="profile-info">
            <h2>Profile Information</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{user.name || 'Not provided'}</p>
              </div>

              <div className="info-item">
                <label>Username</label>
                <p>{user.username || 'Not set'}</p>
              </div>

              <div className="info-item">
                <label>Email</label>
                <p>{user.email}</p>
              </div>

              <div className="info-item">
                <label>Account Type</label>
                <p>{user.googleId ? '🔵 Google Account' : '📧 Email Account'}</p>
              </div>

              <div className="info-item">
                <label>Status</label>
                <p>
                  {user.isVerified ? (
                    <span className="badge badge-verified">✓ Verified</span>
                  ) : (
                    <span className="badge badge-pending">⏳ Pending</span>
                  )}
                </p>
              </div>

              <div className="info-item">
                <label>Member Since</label>
                <p>{joinDate}</p>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-secondary">Edit Profile</button>
            <button className="btn btn-secondary">Change Password</button>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>Account Settings</h3>
            <ul>
              <li><a href="#privacy">Privacy Settings</a></li>
              <li><a href="#notifications">Notifications</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#billing">Billing</a></li>
              <li><a href="#help">Help & Support</a></li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>Quick Stats</h3>
            <div className="stat-item">
              <span>Orders</span>
              <strong>0</strong>
            </div>
            <div className="stat-item">
              <span>Wishlist</span>
              <strong>0</strong>
            </div>
            <div className="stat-item">
              <span>Rewards</span>
              <strong>0 pts</strong>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 UTEShop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Profile;
