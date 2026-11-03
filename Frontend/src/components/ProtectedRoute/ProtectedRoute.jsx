import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/roles";

/*
  Protege una ruta según autenticación y, opcionalmente, según el rol del usuario.
  El rol "admin" puede entrar a todas las rutas protegidas, salvo que se use
  `strict`, en cuyo caso solo entran los roles indicados en `allowedRoles`.

  Uso:
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>

  <ProtectedRoute allowedRoles={["manager"]}>
    <ManagerDashboard />
  </ProtectedRoute>

  <ProtectedRoute allowedRoles={["customer"]} strict>
    <Cart />
  </ProtectedRoute>
*/
function ProtectedRoute({ allowedRoles, strict = false, children }) {
  const { user, loadingUser } = useAuth();
  const location = useLocation();

  // Espera a saber si hay sesión antes de decidir
  if (loadingUser) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Cargando...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (Array.isArray(allowedRoles)) {
    const userRole = normalizeRole(user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    const hasAccess =
      (!strict && userRole === "admin") ||
      normalizedAllowed.includes(userRole);

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
