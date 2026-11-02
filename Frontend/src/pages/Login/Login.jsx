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
  const { loginAsMockUser, loginAsAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleMockLogin() {
    try {
      await loginAsMockUser();
      navigate("/perfil");
    } catch (error) {
      console.error("Error en login de prueba:", error);
      alert("No se pudo iniciar la sesión de prueba.");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Por ahora el único acceso con correo y contraseña es el admin de prueba.
    const adminUser = loginAsAdmin(email, password);

    if (adminUser) {
      navigate("/admin");
      return;
    }

    setError(
      "Correo o contraseña incorrectos. Por ahora puedes entrar con el usuario de prueba."
    );
  }

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
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
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
          {/* ERROR */}
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}


          {/* BOTÓN */}
          <button type="submit" className="login-button">

            Iniciar sesión

            <FontAwesomeIcon icon={faArrowRight} />

          </button>

          <button
            type="button"
            className="login-button"
            onClick={handleMockLogin}
            style={{ width: "100%", marginTop: "15px" }}
          >
            Entrar como usuario de prueba
          </button>

        </form>

        {/* REGISTRO */}
        <div className="login-register">
          <span>¿No tienes una cuenta?</span>

          <Link to="/register">
            Regístrate
          </Link>
        </div>

          <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </main>
  );
}

export default Login;
