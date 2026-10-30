import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  faCartShopping,
  faUser,
  faPepperHot,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { isAdmin } = useAuth();

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        <FontAwesomeIcon icon={faPepperHot} className="logo-icon" />
        <span>PINK PEPPER</span>
      </Link>

      {/* NAVEGACIÓN */}
      <div className="navbar-links">
        <Link to="/" className="active">
          Inicio
        </Link>

        <Link to="/menu">Menú</Link>

        <a href="#nosotros">Nosotros</a>
      </div>

      {/* ACCIONES */}
      <div className="navbar-actions">
        <Link to="/carrito" className="navbar-cart" aria-label="Ver carrito">
          <FontAwesomeIcon icon={faCartShopping} />

          <span className="cart-count">{cartCount}</span>
        </Link>

        {/* Solo visible con la sesión de admin de prueba */}
        {isAdmin && (
          <Link to="/admin" className="navbar-login">
            <FontAwesomeIcon icon={faUserShield} />
            <span>Admin</span>
          </Link>
        )}

        <Link to="/login" className="navbar-login">
          <FontAwesomeIcon icon={faUser} />
          <span>Iniciar sesión</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
