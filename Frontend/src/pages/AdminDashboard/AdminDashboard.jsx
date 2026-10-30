import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faMotorcycle,
  faUserTie,
  faUtensils,
  faUserShield,
  faRightFromBracket,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

/* ---------------------------------------------------------
   VISTAS POR ROL
   Si agregas una vista nueva, añade su ruta aquí.
--------------------------------------------------------- */

const roles = [
  {
    key: "customer",
    title: "Cliente",
    description: "La tienda: explorar el menú, armar el pedido y gestionar el perfil.",
    icon: faUser,
    links: [
      { to: "/", label: "Inicio" },
      { to: "/menu", label: "Menú" },
      { to: "/carrito", label: "Carrito" },
      { to: "/checkout", label: "Checkout" },
      { to: "/perfil", label: "Perfil" },
    ],
  },
  {
    key: "driver",
    title: "Repartidor",
    description: "Pedidos por aceptar y detalle de la entrega en curso.",
    icon: faMotorcycle,
    links: [{ to: "/repartidor", label: "Panel del repartidor" }],
    note: "La entrega activa se abre al aceptar un pedido desde el panel.",
  },
  {
    key: "manager",
    title: "Gerente de local",
    description: "Monitor de pedidos, reportes del local y gestión del menú.",
    icon: faUserTie,
    links: [
      { to: "/gerente", label: "Panel" },
      { to: "/gerente/reportes", label: "Reportes" },
      { to: "/gerente/menu", label: "Menú" },
    ],
  },
  {
    key: "kitchen",
    title: "Cocina",
    description: "Tablero de comandas para los cocineros, sin precios ni datos de entrega.",
    icon: faUtensils,
    links: [{ to: "/cocina", label: "Tablero de cocina" }],
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="admin-page">
      <section className="admin-container">

        {/* ENCABEZADO */}
        <div className="admin-header">
          <span>MODO ADMINISTRADOR</span>
          <h1>Todas las vistas</h1>
          <p>
            Entra a cada rol para revisar su interfaz.
          </p>
        </div>


        {/* SESIÓN */}
        <div className="admin-session">

          <div className="admin-session-info">
            <div className="admin-session-icon">
              <FontAwesomeIcon icon={faUserShield} />
            </div>

            <div>
              <strong>Sesión de prueba</strong>
              <span>{user?.email}</span>
            </div>
          </div>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Cerrar sesión
          </button>

        </div>


        {/* ROLES */}
        <div className="admin-roles-grid">
          {roles.map((role) => (
            <article className="admin-role-card" key={role.key}>

              <div className="admin-role-top">
                <div className="admin-role-icon">
                  <FontAwesomeIcon icon={role.icon} />
                </div>

                <h2>{role.title}</h2>
              </div>

              <p className="admin-role-description">{role.description}</p>

              <div className="admin-role-links">
                {role.links.map((link) => (
                  <Link to={link.to} className="admin-link" key={link.to}>
                    {link.label}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                ))}
              </div>

              {role.note && (
                <small className="admin-role-note">{role.note}</small>
              )}

            </article>
          ))}
        </div>

      </section>
    </main>
  );
}

export default AdminDashboard;
