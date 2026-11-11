import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Chưa đăng nhập thì đá về /login.
// Nếu truyền roles (vd ['leader']) mà user không đúng vai trò thì về /dashboard.
function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default ProtectedRoute;
