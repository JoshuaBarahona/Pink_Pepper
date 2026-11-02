import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  faCartShopping,
  faUser,
  faPepperHot,
  faBars,
  faXmark,
  faCreditCard,
  faRightFromBracket,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

import "./Navbar.css";

function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, loadingUser, logout, welcomeTrigger } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  const [showWelcome, setShowWelcome] = useState(false);
  const [isWelcomeFading, setIsWelcomeFading] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleLogout() {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate("/", { replace: true });
  }

  function closeMenus() {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }

  useEffect(() => {
    if (welcomeTrigger === 0) return;

    setShowWelcome(true);
    setIsWelcomeFading(false);

    const fadeTimer = setTimeout(() => {
      setIsWelcomeFading(true);
    }, 4500);

    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
      setIsWelcomeFading(false);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [welcomeTrigger]);

  // Variable para saber si es un cliente (logueado o no)
  const isClientView = !user || user.role === "cliente";
  const { isAdmin } = useAuth();

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="navbar-logo" onClick={closeMenus}>
      <Link to="/" className="navbar-logo">
        <FontAwesomeIcon icon={faPepperHot} className="logo-icon" />
        <span>PINK PEPPER</span>
      </Link>

      {/* NAVEGACIÓN */}
      <div
        id="navbar-navigation"
        className={`navbar-links ${
          isMobileMenuOpen ? "navbar-links-open" : ""
        }`}
      >
        {/* Enlaces exclusivos para clientes (o gente sin loguear) */}
        {isClientView && (
          <>
            <NavLink to="/" end onClick={closeMenus}>
              Inicio
            </NavLink>
            <NavLink to="/menu" onClick={closeMenus}>
              Menú
            </NavLink>
            <Link to="/#nosotros" onClick={closeMenus}>
              Nosotros
            </Link>
          </>
        )}

        {/* Enlaces exclusivos por Rol */}
        {!loadingUser && isAuthenticated && user?.role === "repartidor" && (
          <NavLink to="/repartidor" onClick={closeMenus}>
            Mis Entregas
          </NavLink>
        )}

        {!loadingUser && isAuthenticated && user?.role === "admin" && (
          <NavLink to="/admin" onClick={closeMenus}>
            Panel Admin
          </NavLink>
        )}

        {!loadingUser && isAuthenticated && user?.role === "gerente" && (
          <NavLink to="/gerente" onClick={closeMenus}>
            Estadísticas
          </NavLink>
        )}
      <div className="navbar-links">
        <Link to="/" className="active">
          Inicio
        </Link>

        <Link to="/menu">Menú</Link>

        <a href="#nosotros">Nosotros</a>
      </div>

      {/* ACCIONES */}
      <div className="navbar-actions">
        
        {/* Carrito: Solo visible para clientes */}
        {isClientView && (
          <Link
            to="/carrito"
            className="navbar-cart"
            aria-label={`Ver carrito, ${cartCount} productos`}
            onClick={closeMenus}
          >
            <FontAwesomeIcon icon={faCartShopping} />
            <span className="cart-count">{cartCount}</span>
          </Link>
        )}

        {/* CUENTA */}
        {loadingUser ? (
          <button
            type="button"
            className="navbar-login navbar-account-loading"
            disabled
            aria-label="Cargando cuenta"
          >
            <FontAwesomeIcon icon={faUser} />
          </button>
        ) : isAuthenticated ? (
          <div className="navbar-profile-wrapper" ref={profileMenuRef}>
            <button
              type="button"
              className="navbar-profile-button"
              aria-label="Abrir menú de perfil"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
            >
              {user?.firstName?.trim()?.charAt(0)?.toUpperCase() || (
                <FontAwesomeIcon icon={faUser} />
              )}
            </button>

            {isProfileMenuOpen && (
              <div className="navbar-profile-menu">
                <div className="navbar-profile-heading">
                  <strong>{user?.firstName || "Mi cuenta"}</strong>
                  <span>{user?.email || ""}</span>
                </div>

                <Link to="/perfil" onClick={closeMenus}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>Mi perfil</span>
                </Link>

                {/* Métodos de pago: Los repartidores no necesitan tarjeta para trabajar */}
                {user?.role === "cliente" && (
                  <Link to="/metodos-pago" onClick={closeMenus}>
                    <FontAwesomeIcon icon={faCreditCard} />
                    <span>Agregar tarjeta</span>
                  </Link>
                )}

                <button
                  type="button"
                  className="navbar-logout-button"
                  onClick={handleLogout}
                >
                  <FontAwesomeIcon icon={faRightFromBracket} />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="navbar-login" onClick={closeMenus}>
            <FontAwesomeIcon icon={faUser} />
            <span>Iniciar sesión</span>
          </Link>
        )}

        {/* BOTÓN HAMBURGUESA */}
        <button
          type="button"
          className="navbar-mobile-toggle"
          aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="navbar-navigation"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} />
        </button>

        {/* SALUDO DE BIENVENIDA */}
        {isAuthenticated && showWelcome && (
          <div
            className={`navbar-welcome ${
              isWelcomeFading ? "navbar-welcome-fading" : ""
            }`}
            role="status"
            aria-live="polite"
          >
            Hola, {user?.firstName}
          </div>
        )}
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
