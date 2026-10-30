import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/*
  Protege una ruta según el rol del usuario.
  El rol "admin" puede entrar a todas las rutas protegidas.

  Uso:
  <ProtectedRoute allowedRoles={["manager"]}>
    <ManagerDashboard />
  </ProtectedRoute>
*/
function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loadingUser } = useAuth();

  // Espera a saber si hay sesión antes de decidir
  if (loadingUser) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = user.role === "admin" || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
