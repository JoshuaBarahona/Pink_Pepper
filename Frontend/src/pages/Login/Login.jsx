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
const { loginAsMockUser } = useAuth();

async function handleMockLogin() {
  try {
    await loginAsMockUser();
    navigate("/perfil");
  } catch (error) {
    console.error("Error en login de prueba:", error);
    alert("No se pudo iniciar la sesión de prueba.");
  }
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

          <p>
            Inicia sesión para continuar.
          </p>

        </div>


        {/* FORMULARIO */}
        <form className="login-form">

          {/* CORREO */}
          <div className="login-field">

            <label htmlFor="email">
              Correo electrónico
            </label>

            <div className="input-wrapper">

              <FontAwesomeIcon icon={faEnvelope} />

              <input
                type="email"
                id="email"
                placeholder="tucuenta@email.com"
              />

            </div>

          </div>


          {/* CONTRASEÑA */}
          <div className="login-field">

            <label htmlFor="password">
              Contraseña
            </label>

            <div className="input-wrapper">

              <FontAwesomeIcon icon={faLock} />

              <input
                type="password"
                id="password"
                placeholder="••••••••"
              />

            </div>

          </div>


          {/* RECORDAR / RECUPERAR */}
          <div className="login-options">

            <label className="remember-me">

              <input type="checkbox" />

              <span>Recordarme</span>

            </label>

            <a href="#">
              ¿Olvidaste tu contraseña?
            </a>

          </div>


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

      </div>

    </main>
  );
}

export default Login;