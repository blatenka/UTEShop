import { Link, useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home({ isLoggedIn, user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="home">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            🛒 UTEShop Book Shop
          </Link>
          
          <div className="navbar-menu">
            {isLoggedIn ? (
              <>
                <span className="user-greeting">Hello, {user?.name || user?.email}!</span>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="nav-btn btn-logout">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to UTEShop</h1>
          <p>Discover amazing products at great prices</p>
          {!isLoggedIn && (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="products-section">
        <div className="container">
          <h2>Featured Products</h2>
          <div className="products-grid">
            {[1, 2, 3, 4, 5, 6].map((id) => (
              <div key={id} className="product-card">
                <div className="product-image">
                  <div className="placeholder">Product {id}</div>
                </div>
                <div className="product-info">
                  <h3>Product {id}</h3>
                  <p className="price">$99.99</p>
                  <button className="btn btn-secondary">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 UTEShop. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
