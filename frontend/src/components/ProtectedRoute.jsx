import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Component bảo vệ các route cần xác thực
 * Nếu không có token, sẽ chuyển hướng về trang chủ
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);

  // Kiểm tra token từ Redux state hoặc localStorage
  const hasToken = token || localStorage.getItem('token');

  if (!hasToken) {
    // Nếu không có token, chuyển hướng về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu có token, hiển thị component
  return children;
};

export default ProtectedRoute;
