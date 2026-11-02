/* ---------------------------------------------------------
   USUARIO ADMIN DE PRUEBA

   Solo sirve para revisar todas las vistas mientras no exista
   un backend con autenticación real. Las credenciales viven en
   el código del navegador, así que cualquiera puede leerlas.

   Antes de publicar el sitio: poner TEST_ADMIN_ENABLED en false
   o borrar este archivo.
--------------------------------------------------------- */

export const TEST_ADMIN_ENABLED = true;

const TEST_ADMIN_EMAIL = "admin@pinkpepper.com";
const TEST_ADMIN_PASSWORD = "pink123";

const ADMIN_SESSION_KEY = "pinkPepperTestAdminSession";

// Misma forma que el usuario que usan Profile y Checkout,
// más el campo `role`.
function createTestAdminUser() {
  return {
    id: "test-admin",
    role: "admin",
    firstName: "Admin",
    middleName: "",
    lastName: "Pink Pepper",
    secondLastName: "",
    email: TEST_ADMIN_EMAIL,
    phone: "8888 0000",
    addresses: [],
    paymentMethods: [],
  };
}

export function loginTestAdmin(email, password) {
  if (!TEST_ADMIN_ENABLED) return null;

  const isValid =
    email.trim().toLowerCase() === TEST_ADMIN_EMAIL &&
    password === TEST_ADMIN_PASSWORD;

  if (!isValid) return null;

  try {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
  } catch (error) {
    console.error("No se pudo guardar la sesión de admin:", error);
  }

  return createTestAdminUser();
}

export function getAdminSession() {
  if (!TEST_ADMIN_ENABLED) return null;

  try {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "true"
      ? createTestAdminUser()
      : null;
  } catch {
    return null;
  }
}

export function logoutTestAdmin() {
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (error) {
    console.error("No se pudo cerrar la sesión de admin:", error);
  }
}
