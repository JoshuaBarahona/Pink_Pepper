
import { mockUser } from "../data/mockUser";

const SESSION_KEY = "pinkpepper_session";
const USERS_KEY = "pinkpepper_users";

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex) {
  return new Uint8Array(
    hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 150000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  return bytesToHex(new Uint8Array(derivedBits));
}

async function createPasswordCredentials(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));

  return {
    passwordSalt: bytesToHex(salt),
    passwordHash: await hashPassword(password, salt),
  };
}

async function verifyPassword(password, saltHex, expectedHash) {
  const salt = hexToBytes(saltHex);
  const actualHash = await hashPassword(password, salt);

  return actualHash === expectedHash;
}

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
    users.find((user) => String(user.id) === sessionId) ?? null
  );
}

// Crear o recuperar el usuario de prueba
export function initializeMockUser() {
  const users = getUsers();

  const mockEmail = mockUser.email.trim().toLowerCase();

  const existingUser = users.find(
    (user) => (user.email || "").trim().toLowerCase() === mockEmail
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

  localStorage.setItem(SESSION_KEY, String(user.id));

  return user;
}

// Actualizar información del usuario

export function saveUser(updatedUser) {
  const users = getUsers();

  const email = (updatedUser.email || "").trim().toLowerCase();

  if (!email) {
    throw new Error("Debes ingresar un correo electrónico.");
  }

  const emailExists = users.some(
    (user) =>
      String(user.id) !== String(updatedUser.id) &&
      (user.email || "").trim().toLowerCase() === email
  );

  if (emailExists) {
    throw new Error("Este correo ya está registrado en otra cuenta.");
  }

  const userExists = users.some(
    (user) => String(user.id) === String(updatedUser.id)
  );

  if (!userExists) {
    throw new Error("No se encontró el usuario que deseas actualizar.");
  }

  const userToSave = {
    ...updatedUser,
    email,
  };

  const updatedUsers = users.map((user) =>
    String(user.id) === String(userToSave.id)
      ? userToSave
      : user
  );

  saveUsers(updatedUsers);

  return userToSave;
}


// Cerrar sesión
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

// Registrar un usuario nuevo
export async function registerUser(userData) {
  const users = getUsers();

  const email = (userData.email || "").trim().toLowerCase();

  if (!email) {
    throw new Error("Debes ingresar un correo electrónico.");
  }

  const existingUser = users.find(
    (user) => (user.email || "").trim().toLowerCase() === email
  );

  if (existingUser) {
    throw new Error("Este correo ya está registrado.");
  }

  if (!userData.password) {
    throw new Error("Debes ingresar una contraseña.");
  }

  const credentials = await createPasswordCredentials(userData.password);

  const newUser = {
    id: crypto.randomUUID(),
    firstName: (userData.firstName || "").trim().replace(/\s+/g, " "),
    middleName: (userData.middleName || "").trim().replace(/\s+/g, " "),
    lastName: (userData.lastName || "").trim().replace(/\s+/g, " "),
    secondLastName: (userData.secondLastName || "").trim().replace(/\s+/g, " "),
    email,
    ...credentials,
    phone: "",
    addresses: [],
    paymentMethods: [],
  };

  saveUsers([...users, newUser]);

  localStorage.setItem(SESSION_KEY, String(newUser.id));

  return newUser;
}

// Iniciar sesión de prueba mediante correo
export async function loginUser(email, password) {
  const users = getUsers();

  const normalizedEmail = (email || "").trim().toLowerCase();

  const foundUser = users.find(
    (user) => (user.email || "").trim().toLowerCase() === normalizedEmail
  );

  if (!foundUser) {
    throw new Error("El correo electrónico o la contraseña son incorrectos.");
  }

  if (!foundUser.passwordSalt || !foundUser.passwordHash) {
    throw new Error(
      "Esta cuenta de prueba no tiene una contraseña configurada. Registra una cuenta nueva para continuar."
    );
  }

  const isValidPassword = await verifyPassword(
    password || "",
    foundUser.passwordSalt,
    foundUser.passwordHash
  );

  if (!isValidPassword) {
    throw new Error("El correo electrónico o la contraseña son incorrectos.");
  }

  localStorage.setItem(SESSION_KEY, String(foundUser.id));

  const { passwordHash, passwordSalt, ...safeUser } = foundUser;

  return safeUser;
}