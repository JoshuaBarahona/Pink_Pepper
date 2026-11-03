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
  const {
    user,
    isAuthenticated,
    isAdmin,
    loadingUser,
    logout,
    welcomeTrigger,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationKey = `${location.pathname}${location.search}${location.hash}`;
  const [mobileMenuKey, setMobileMenuKey] = useState(null);
  const [profileMenuKey, setProfileMenuKey] = useState(null);

  const isMobileMenuOpen = mobileMenuKey === locationKey;
  const isProfileMenuOpen = profileMenuKey === locationKey;

  const profileMenuRef = useRef(null);

  const [fadingTrigger, setFadingTrigger] = useState(0);
  const [hiddenTrigger, setHiddenTrigger] = useState(0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuKey(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function closeMenus() {
    setMobileMenuKey(null);
    setProfileMenuKey(null);
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    if (welcomeTrigger === 0) return;

    const fadeTimer = setTimeout(() => {
      setFadingTrigger(welcomeTrigger);
    }, 4500);

    const hideTimer = setTimeout(() => {
      setHiddenTrigger(welcomeTrigger);
    }, 5000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [welcomeTrigger]);

  const showWelcome = welcomeTrigger > 0 && hiddenTrigger < welcomeTrigger;
  const isWelcomeFading = fadingTrigger === welcomeTrigger;

  const role = user?.role;
  const isCustomer =
    !user || !role || role === "cliente" || role === "customer";
  const showStoreNavigation = isCustomer || isAdmin;
  const isDriver = role === "driver" || role === "repartidor";
  const isManager = role === "manager" || role === "gerente";
  const isKitchen = role === "kitchen" || role === "cocina";

  return (
    <nav className="navbar">
      {/* LOGO */}
      <Link to="/" className="navbar-logo" onClick={closeMenus}>
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
        {/* Enlaces de la tienda (clientes, visitantes y admin en pruebas) */}
        {showStoreNavigation && (
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
        {!loadingUser && isAuthenticated && isDriver && (
          <NavLink to="/repartidor" onClick={closeMenus}>
            Mis Entregas
          </NavLink>
        )}

        {!loadingUser && isAuthenticated && isManager && (
          <NavLink to="/gerente" onClick={closeMenus}>
            Panel Gerente
          </NavLink>
        )}

        {!loadingUser && isAuthenticated && isKitchen && (
          <NavLink to="/cocina" onClick={closeMenus}>
            Cocina
          </NavLink>
        )}

        {!loadingUser && isAuthenticated && isAdmin && (
          <NavLink to="/admin" onClick={closeMenus}>
            <FontAwesomeIcon icon={faUserShield} /> Panel Admin
          </NavLink>
        )}
      </div>

      {/* ACCIONES */}
      <div className="navbar-actions">
        {/* Carrito (exclusivo para clientes; los visitantes van al login) */}
        {isCustomer && (
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
              onClick={() =>
                setProfileMenuKey((prev) =>
                  prev === locationKey ? null : locationKey
                )
              }
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

                {(isCustomer || isAdmin) && (
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
          onClick={() =>
            setMobileMenuKey((prev) =>
              prev === locationKey ? null : locationKey
            )
          }
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
      </div>
    </nav>
  );
}

export default Navbar;
