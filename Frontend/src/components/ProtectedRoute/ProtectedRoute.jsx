import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ROLE_ALIASES = {
  repartidor: "driver",
  driver: "driver",
  gerente: "manager",
  manager: "manager",
  cocina: "kitchen",
  kitchen: "kitchen",
  cliente: "customer",
  customer: "customer",
  admin: "admin",
};

function normalizeRole(role) {
  return ROLE_ALIASES[role] || role || "customer";
}

/*
  Protege una ruta según autenticación y, opcionalmente, según el rol del usuario.
  El rol "admin" puede entrar a todas las rutas protegidas.

  Uso:
  <ProtectedRoute>
    <Profile />
  </ProtectedRoute>

  <ProtectedRoute allowedRoles={["manager"]}>
    <ManagerDashboard />
  </ProtectedRoute>
*/
function ProtectedRoute({ allowedRoles, children }) {
  const { user, loadingUser } = useAuth();

  // Espera a saber si hay sesión antes de decidir
  if (loadingUser) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>Cargando...</div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles)) {
    const userRole = normalizeRole(user.role);
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    const hasAccess =
      userRole === "admin" || normalizedAllowed.includes(userRole);

    if (!hasAccess) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
