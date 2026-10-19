
import { mockUser } from "../data/mockUser";

const SESSION_KEY = "pinkpepper_session";
const USERS_KEY = "pinkpepper_users";

// Obtener usuarios de prueba
export function getUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const users = stored ? JSON.parse(stored) : [];

    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

// Guardar usuarios de prueba
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Obtener el usuario de la sesión actual
export async function getCurrentUser() {
  const sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    return null;
  }

  const users = getUsers();

  return (
    users.find(
      (user) => String(user.id) === sessionId
    ) ?? null
  );
}

// Crear o recuperar el usuario mock
export function initializeMockUser() {
  const users = getUsers();

  const existingUser = users.find(
    (user) => user.email === mockUser.email
  );

  if (existingUser) {
    return existingUser;
  }

  const newMockUser = structuredClone(mockUser);

  saveUsers([...users, newMockUser]);

  return newMockUser;
}

// Iniciar sesión de prueba con el usuario mock
export async function loginMockUser() {
  const user = initializeMockUser();

  localStorage.setItem(
    SESSION_KEY,
    String(user.id)
  );

  return user;
}

// Actualizar información del usuario
export function saveUser(updatedUser) {
  const users = getUsers();

  const updatedUsers = users.map((user) =>
    String(user.id) === String(updatedUser.id)
      ? updatedUser
      : user
  );

  saveUsers(updatedUsers);

  return updatedUser;
}

// Cerrar sesión
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}


export async function registerUser(userData) {
  const users = getUsers();

  const email = userData.email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.email.toLowerCase() === email
  );

  if (existingUser) {
    throw new Error("Este correo ya está registrado.");
  }

  const newUser = {
    id: crypto.randomUUID(),
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    email,
    phone: "",
    addresses: [],
    paymentMethods: [],
  };

  saveUsers([...users, newUser]);

  localStorage.setItem(
    "pinkpepper_session",
    String(newUser.id)
  );

  return newUser;
}

export async function loginUser(email) {
  const users = getUsers();

  const normalizedEmail = email.trim().toLowerCase();

  const foundUser = users.find(
    (user) => user.email.toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    throw new Error(
      "No existe una cuenta de prueba con este correo."
    );
  }

  localStorage.setItem(
    "pinkpepper_session",
    String(foundUser.id)
  );

  return foundUser;
}

