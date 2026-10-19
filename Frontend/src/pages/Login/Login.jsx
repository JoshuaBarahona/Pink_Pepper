import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  faPepperHot,
  faEnvelope,
  faLock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setIsSubmitting(true);

      await login(
  formData.email.trim().toLowerCase(),
  formData.password
);

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "No se pudo iniciar sesión.");
    } finally {
      setIsSubmitting(false);
    }

    // Dentro de la función handleSubmit de tu Login.jsx
const loggedUser = await login(email, password);

      if (loggedUser.role === "repartidor") {
        navigate("/repartidor");
      } else if (loggedUser.role === "admin") {
        navigate("/admin");
      } else if (loggedUser.role === "gerente") {
        navigate("/gerente");
      } else {
        navigate("/"); // Los clientes van al Home
      }
  }

  /*async function handleMockLogin() {
    setError("");

    try {
      setIsSubmitting(true);

      await loginAsMockUser();

      navigate("/perfil", { replace: true });
    } catch (err) {
      setError("No se pudo iniciar la sesión de prueba.");
      console.error("Error en login de prueba:", err);
    } finally {
      setIsSubmitting(false);
    }
  }*/

  return (
    <main className="login-page">
      <div className="login-card">
        {/* LOGO */}
        <div className="login-logo">
          <FontAwesomeIcon icon={faPepperHot} />
          <span>PINK PEPPER</span>
        </div>

        {/* ENCABEZADO */}
        <div className="login-header">
          <h1>¡Bienvenido de vuelta!</h1>
          <p>Inicia sesión para continuar.</p>
        </div>

        {/* FORMULARIO */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* CORREO */}
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>

            <div className="input-wrapper">
              <FontAwesomeIcon icon={faEnvelope} />

              <input
                type="email"
                id="email"
                name="email"
                placeholder="tucuenta@email.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* CONTRASEÑA */}
          <div className="login-field">
            <label htmlFor="password">Contraseña</label>

            <div className="input-wrapper">
              <FontAwesomeIcon icon={faLock} />

              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* OPCIONES */}
          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />

              <span>Recordarme</span>
            </label>

            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              title="La recuperación de contraseña se implementará después"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          {/* BOTÓN DE INICIO DE SESIÓN */}
          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}

            {!isSubmitting && (
              <FontAwesomeIcon icon={faArrowRight} />
            )}
          </button>
        </form>

        {/* REGISTRO */}
        <div className="login-register">
          <span>¿No tienes una cuenta?</span>

          <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </main>
  );
}

export default Login;