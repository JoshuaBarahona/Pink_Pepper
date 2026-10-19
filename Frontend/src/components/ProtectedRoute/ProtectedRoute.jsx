// src/components/ProtectedRoute/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loadingUser } = useAuth();

  if (loadingUser) {
    return <div style={{ textAlign: "center", padding: "50px" }}>Cargando...</div>;
  }

  // Si no está logueado, lo mandamos al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está logueado pero su rol no está permitido, lo mandamos al inicio
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;