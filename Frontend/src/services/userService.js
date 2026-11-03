import api, { TOKEN_KEY } from "./api";
import { mockUser } from "../data/mockUser";

const SESSION_KEY = "pinkpepper_session";
const USERS_KEY = "pinkpepper_users";

function mapBackendUser(usuario) {
  return {
    id: usuario.id_usuario,
    firstName: usuario.primer_nombre,
    middleName: usuario.segundo_nombre || "",
    lastName: usuario.primer_apellido,
    secondLastName: usuario.segundo_apellido || "",
    email: usuario.correo,
    phone: usuario.telefono || "",
    role: usuario.rol.toLowerCase(),
    addresses: [],
    paymentMethods: [],
  };
}

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
  const token = localStorage.getItem(TOKEN_KEY);

  // Si existe un JWT, consultamos el perfil real del backend.
  if (token) {
    const response = await api.get("/auth/profile");
    return mapBackendUser(response.data);
  }

  // Si no hay JWT, mantenemos el usuario de prueba.
  const sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    return null;
  }

  const users = getUsers();

  return users.find((user) => String(user.id) === sessionId) ?? null;
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

// Actualizar perfil de un usuario autenticado en el backend
export async function updateProfileUser(updatedUser) {
  const response = await api.patch("/auth/profile", {
    primer_nombre: updatedUser.firstName,
    segundo_nombre: updatedUser.middleName,
    primer_apellido: updatedUser.lastName,
    segundo_apellido: updatedUser.secondLastName,
    correo: updatedUser.email.trim().toLowerCase(),
    telefono: updatedUser.phone,
  });

  return mapBackendUser(response.data);
}


// Cerrar sesión
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

// Registrar un usuario nuevo
export async function registerUser(userData) {
  const response = await api.post("/auth/register", {
    primer_nombre: userData.firstName,
    segundo_nombre: userData.middleName || "",
    primer_apellido: userData.lastName,
    segundo_apellido: userData.secondLastName || "",
    correo: userData.email.trim().toLowerCase(),
    password: userData.password,
  });

  // Guardamos el token que devuelve el backend.
  localStorage.setItem(TOKEN_KEY, response.data.access_token);

  return mapBackendUser(response.data.usuario);
}

// Iniciar sesión de prueba mediante correo
export async function loginUser(email, password) {
  const response = await api.post("/auth/login", {
    correo: email.trim().toLowerCase(),
    password,
  });

  localStorage.setItem(TOKEN_KEY, response.data.access_token);

  return mapBackendUser(response.data.usuario);
}

// Convertir una dirección del backend al formato del frontend
function mapBackendAddress(address) {
  return {
    id: address.id_direccion,
    label: address.nombre_direccion,
    address: address.direccion,
    reference: address.referencia || "",
    isDefault: address.es_principal,
  };
}

// Consultar las direcciones del usuario autenticado
export async function getAddresses() {
  const response = await api.get("/addresses");

  return response.data.map(mapBackendAddress);
}

// Registrar una dirección
export async function createAddress(addressData) {
  const response = await api.post("/addresses", {
    nombre_direccion: addressData.label,
    direccion: addressData.address,
    referencia: addressData.reference || "",
    es_principal: addressData.isDefault,
  });

  return mapBackendAddress(response.data);
}

// Actualizar una dirección
export async function updateAddress(addressId, addressData) {
  const response = await api.patch(`/addresses/${addressId}`, {
    nombre_direccion: addressData.label,
    direccion: addressData.address,
    referencia: addressData.reference || "",
  });

  return mapBackendAddress(response.data);
}

// Eliminar una dirección
export async function deleteAddress(addressId) {
  const response = await api.delete(`/addresses/${addressId}`);

  return response.data;
}

// Establecer una dirección como principal
export async function setDefaultAddress(addressId) {
  const response = await api.patch(`/addresses/${addressId}/default`);

  return mapBackendAddress(response.data);
}

// Convertir un método de pago del backend al formato del frontend
function mapBackendPaymentMethod(paymentMethod) {
  return {
    id: paymentMethod.id_metodo_pago,
    type: paymentMethod.tipo,
    holder: paymentMethod.titular || "",
    brand: paymentMethod.marca || "",
    lastFour: paymentMethod.ultimos_digitos || "",
    expirationMonth: paymentMethod.mes_expiracion,
    expirationYear: paymentMethod.anio_expiracion,
    isDefault: paymentMethod.es_principal,
  };
}

// Consultar las tarjetas del usuario autenticado
export async function getPaymentMethods() {
  const response = await api.get("/payment-methods");

  return response.data.map(mapBackendPaymentMethod);
}

// Registrar una tarjeta
export async function createPaymentMethod(paymentData) {
  const response = await api.post("/payment-methods", {
    titular: paymentData.holder,
    marca: paymentData.brand,
    ultimos_digitos: paymentData.lastFour,
    mes_expiracion: Number(paymentData.expirationMonth),
    anio_expiracion: Number(paymentData.expirationYear),
    es_principal: paymentData.isDefault,
  });

  return mapBackendPaymentMethod(response.data);
}

// Actualizar una tarjeta
export async function updatePaymentMethod(paymentMethodId, paymentData) {
  const response = await api.patch(`/payment-methods/${paymentMethodId}`, {
    titular: paymentData.holder,
    marca: paymentData.brand,
    ultimos_digitos: paymentData.lastFour,
    mes_expiracion: Number(paymentData.expirationMonth),
    anio_expiracion: Number(paymentData.expirationYear),
  });

  return mapBackendPaymentMethod(response.data);
}

// Eliminar una tarjeta
export async function deletePaymentMethod(paymentMethodId) {
  const response = await api.delete(`/payment-methods/${paymentMethodId}`);

  return response.data;
}

// Establecer una tarjeta como principal
export async function setDefaultPaymentMethod(paymentMethodId) {
  const response = await api.patch(
    `/payment-methods/${paymentMethodId}/default`
  );

  return mapBackendPaymentMethod(response.data);
}