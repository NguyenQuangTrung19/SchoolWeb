// src/components/common/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu user không có quyền → điều hướng về dashboard đúng role
    if (user.role === "ADMIN")
      return <Navigate to="/admin/dashboard" replace />;
    if (user.role === "TEACHER")
      return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "STUDENT")
      return <Navigate to="/student/dashboard" replace />;

    // fallback
    return <Navigate to="/login" replace />;
  }

  return children;
}
