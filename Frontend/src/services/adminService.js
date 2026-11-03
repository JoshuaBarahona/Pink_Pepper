import api from "./api";

/* ---------------------------------------------------------
   USUARIO ADMIN DE PRUEBA
--------------------------------------------------------- */

export const TEST_ADMIN_ENABLED = false;

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

/* ---------------------------------------------------------
   SERVICIOS API DE ADMINISTRACIÓN REAL (ADMIN)
--------------------------------------------------------- */

// Listar empleados operativos: cocineros, repartidores y gerentes
export async function getEmployees(params) {
  const response = await api.get("/admin/employees", { params });
  return response.data;
}

// Listar todos los usuarios registrados con filtros
export async function getAdminUsers(params) {
  const response = await api.get("/admin/users", { params });
  return response.data;
}

// Obtener el detalle de un usuario por ID
export async function getAdminUserById(userId) {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
}

// Crear un nuevo usuario o empleado con rol específico
export async function createAdminUser(userData) {
  const response = await api.post("/admin/users", userData);
  return response.data;
}

// Actualizar datos de un usuario
export async function updateAdminUser(userId, userData) {
  const response = await api.patch(`/admin/users/${userId}`, userData);
  return response.data;
}

// Cambiar el rol de un usuario
export async function changeUserRole(userId, role) {
  const response = await api.patch(`/admin/users/${userId}/role`, {
    rol: role,
  });
  return response.data;
}

// Cambiar el estado activo/inactivo de un usuario
export async function changeUserStatus(userId, estado) {
  const response = await api.patch(`/admin/users/${userId}/status`, {
    estado,
  });
  return response.data;
}

// Reactivar un usuario
export async function restoreAdminUser(userId) {
  const response = await api.patch(`/admin/users/${userId}/restore`);
  return response.data;
}

// Desactivar lógicamente un usuario (soft-delete)
export async function deactivateAdminUser(userId) {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
}
