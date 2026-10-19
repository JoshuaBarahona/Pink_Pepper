import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import {
  faPepperHot,
  faUser,
  faEnvelope,
  faLock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

import "./Register.css";

function Register() {

  
const navigate = useNavigate();
const { register } = useAuth();

const [formData, setFormData] = useState({
  firstName: "",
  middleName: "",
  lastName: "",
  secondLastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);

function handleChange(e) {
  const { name, value, type, checked } = e.target;

  setFormData((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
  }));
}

async function handleSubmit(e) {
  e.preventDefault();
  setError("");

  if (!formData.firstName.trim() || !formData.lastName.trim()) {
    setError("El primer nombre y el primer apellido son obligatorios.");
    return;
  }

  if (formData.password.length < 8) {
    setError("La contraseña debe tener al menos 8 caracteres.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("Las contraseñas no coinciden.");
    return;
  }

  if (!formData.acceptTerms) {
    setError("Debes aceptar los términos y condiciones.");
    return;
  }

  try {
    setIsSubmitting(true);

    await register({
      firstName: formData.firstName.trim().replace(/\s+/g, " "),
      middleName: formData.middleName.trim().replace(/\s+/g, " "),
      lastName: formData.lastName.trim().replace(/\s+/g, " "),
      secondLastName: formData.secondLastName.trim().replace(/\s+/g, " "),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    });

    navigate("/perfil", { replace: true });
  } catch (err) {
    setError(err.message || "No se pudo crear la cuenta.");
  } finally {
    setIsSubmitting(false);
  }
}


  return (
    <main className="register-page">

      <div className="register-card">

        {/* LOGO */}
        <div className="register-logo">

          <FontAwesomeIcon icon={faPepperHot} />

          <span>PINK PEPPER</span>

        </div>


        {/* ENCABEZADO */}
        <div className="register-header">

          <h1>Crea tu cuenta</h1>

          <p>
            Regístrate para disfrutar de Pink Pepper.
          </p>

        </div>


        {/* FORMULARIO */}
        <form className="register-form" onSubmit={handleSubmit}>

          {/* NOMBRE */}
          
{/* PRIMER NOMBRE */}
<div className="register-field">
  <label htmlFor="register-first-name">
    Primer nombre
  </label>

  <div className="register-input-wrapper">
    <FontAwesomeIcon icon={faUser} />

    <input
      type="text"
      id="register-first-name"
      name="firstName"
      value={formData.firstName}
      onChange={handleChange}
      placeholder="Tu primer nombre"
      autoComplete="given-name"
      required
    />
  </div>
</div>

{/* SEGUNDO NOMBRE */}
<div className="register-field">
  <label htmlFor="register-middle-name">
    Segundo nombre (opcional)
  </label>

  <div className="register-input-wrapper">
    <FontAwesomeIcon icon={faUser} />

    <input
      type="text"
      id="register-middle-name"
      name="middleName"
      value={formData.middleName}
      onChange={handleChange}
      placeholder="Tu segundo nombre"
      autoComplete="additional-name"
    />
  </div>
</div>

{/* PRIMER APELLIDO */}
<div className="register-field">
  <label htmlFor="register-last-name">
    Primer apellido
  </label>

  <div className="register-input-wrapper">
    <FontAwesomeIcon icon={faUser} />

    <input
      type="text"
      id="register-last-name"
      name="lastName"
      value={formData.lastName}
      onChange={handleChange}
      placeholder="Tu primer apellido"
      autoComplete="family-name"
      required
    />
  </div>
</div>

{/* SEGUNDO APELLIDO */}
<div className="register-field">
  <label htmlFor="register-second-last-name">
    Segundo apellido (opcional)
  </label>

  <div className="register-input-wrapper">
    <FontAwesomeIcon icon={faUser} />

    <input
      type="text"
      id="register-second-last-name"
      name="secondLastName"
      value={formData.secondLastName}
      onChange={handleChange}
      placeholder="Tu segundo apellido"
    />
  </div>
</div>
          {/* CORREO */}
          <div className="register-field">

            <label htmlFor="register-email">
              Correo electrónico
            </label>

            <div className="register-input-wrapper">

              <FontAwesomeIcon icon={faEnvelope} />

              <input
                type="email"
                id="register-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                autoComplete="email"
                required
              />

            </div>

          </div>


          {/* CONTRASEÑA */}
          <div className="register-field">

            <label htmlFor="register-password">
              Contraseña
            </label>

            <div className="register-input-wrapper">

              <FontAwesomeIcon icon={faLock} />

              <input
                type="password"
                id="register-password"
                placeholder="••••••••"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* CONFIRMAR CONTRASEÑA */}
          <div className="register-field">

            <label htmlFor="register-confirm-password">
              Confirmar contraseña
            </label>

            <div className="register-input-wrapper">

              <FontAwesomeIcon icon={faLock} />

              <input
                type="password"
                id="register-confirm-password"
                placeholder="••••••••"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* TÉRMINOS */}
          <label className="register-terms">

            <input 
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            />

            <span>
              Acepto los términos y condiciones.
            </span>

          </label>


          {/* BOTÓN */}
          <button
            type="submit"
            className="register-button"
          >

            Crear cuenta

            <FontAwesomeIcon icon={faArrowRight} />

          </button>

        </form>


        {/* LOGIN */}
        <div className="register-login">
  <span>¿Ya tienes una cuenta?</span>

  <Link to="/login">
    Inicia sesión
  </Link>
</div>

      </div>

    </main>
  );
}

export default Register;