import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  loginMockUser,
  saveUser,
  updateProfileUser,
  logoutUser,
  registerUser,
  loginUser,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getPaymentMethods,
createPaymentMethod,
updatePaymentMethod,
deletePaymentMethod,
setDefaultPaymentMethod,
} from "../services/userService";

import {
  getAdminSession,
  loginTestAdmin,
  logoutTestAdmin,
} from "../services/adminService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [welcomeTrigger, setWelcomeTrigger] = useState(0);

  // Registrar un usuario
  async function register(userData) {
  logoutTestAdmin();

  const registeredUser = await registerUser(userData);

  const registeredUserFromBackend = {
  ...registeredUser,
  ...(typeof registeredUser.id === "number"
    ? {
        addresses: await getAddresses(),
        paymentMethods: await getPaymentMethods(),
      }
    : {}),
};

  setUser(registeredUserFromBackend);
  setWelcomeTrigger((current) => current + 1);

  return registeredUserFromBackend;
}

  // Iniciar sesión (soporta tanto admin de prueba como usuarios registrados)
async function login(email, password) {
  logoutTestAdmin();

  const loggedUser = await loginUser(email, password);

  const loggedUserFromBackend = {
  ...loggedUser,
  ...(typeof loggedUser.id === "number"
    ? {
        addresses: await getAddresses(),
        paymentMethods: await getPaymentMethods(),
      }
    : {}),
};

  setUser(loggedUserFromBackend);
  setWelcomeTrigger((current) => current + 1);

  return loggedUserFromBackend;
}

  // Cargar la sesión existente
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

const userWithAddresses = currentUser
  ? {
      ...currentUser,
      ...(typeof currentUser.id === "number"
        ? {
            addresses: await getAddresses(),
            paymentMethods: await getPaymentMethods(),
          }
        : {}),
    }
  : null;

setUser(userWithAddresses ?? getAdminSession());
      } catch (error) {
        console.error("Error cargando usuario:", error);
        setUser(getAdminSession());
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  // Inicio de sesión temporal con usuario de prueba
  async function loginAsMockUser() {
    // Evita que quede una sesión de admin activa al mismo tiempo
    logoutTestAdmin();

    const loggedUser = await loginMockUser();

    setUser(loggedUser);
    setWelcomeTrigger((current) => current + 1);

    return loggedUser;
  }

  // Inicio de sesión del admin de prueba.
  // Devuelve el usuario si las credenciales son correctas, o null si no.
  function loginAsAdmin(email, password) {
    const adminUser = loginTestAdmin(email, password);

    if (!adminUser) return null;

    // Evita que quede una sesión de usuario normal al mismo tiempo
    logoutUser();

    setUser(adminUser);
    setWelcomeTrigger((current) => current + 1);

    return adminUser;
  }

  // Actualizar datos del perfil
  function updateUser(updatedUser) {
    if (updatedUser?.id === "test-admin") {
      setUser(updatedUser);
      return;
    }

    const savedUser = saveUser(updatedUser);

    setUser(savedUser);
  }

  // Actualizar información personal mediante el backend
async function updateProfile(updatedUser) {
  const updatedUserFromBackend = await updateProfileUser(updatedUser);

  setUser((currentUser) => ({
    ...currentUser,
    ...updatedUserFromBackend,
  }));

  return updatedUserFromBackend;
}

// Cargar las direcciones del usuario autenticado
async function refreshAddresses() {
  const addresses = await getAddresses();

  setUser((currentUser) =>
    currentUser
      ? { ...currentUser, addresses }
      : currentUser
  );

  return addresses;
}

// Registrar una dirección
async function addAddress(addressData) {
  await createAddress(addressData);
  return refreshAddresses();
}

// Editar una dirección
async function editAddress(addressId, addressData) {
  await updateAddress(addressId, addressData);
  return refreshAddresses();
}

// Eliminar una dirección
async function removeAddress(addressId) {
  await deleteAddress(addressId);
  return refreshAddresses();
}

// Establecer una dirección como principal
async function makeDefaultAddress(addressId) {
  await setDefaultAddress(addressId);
  return refreshAddresses();
}

// Cargar los métodos de pago del usuario autenticado
async function refreshPaymentMethods() {
  const paymentMethods = await getPaymentMethods();

  setUser((currentUser) =>
    currentUser
      ? { ...currentUser, paymentMethods }
      : currentUser
  );

  return paymentMethods;
}

// Registrar una tarjeta
async function addPaymentMethod(paymentData) {
  await createPaymentMethod(paymentData);
  return refreshPaymentMethods();
}

// Editar una tarjeta
async function editPaymentMethod(paymentMethodId, paymentData) {
  await updatePaymentMethod(paymentMethodId, paymentData);
  return refreshPaymentMethods();
}

// Eliminar una tarjeta
async function removePaymentMethod(paymentMethodId) {
  await deletePaymentMethod(paymentMethodId);
  return refreshPaymentMethods();
}

// Establecer una tarjeta como principal
async function makeDefaultPaymentMethod(paymentMethodId) {
  await setDefaultPaymentMethod(paymentMethodId);
  return refreshPaymentMethods();
}

  // Cerrar sesión
  function logout() {
    logoutUser();
    logoutTestAdmin();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loadingUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loginAsMockUser,
        loginAsAdmin,
        logout,
        register,
        login,
        welcomeTrigger,
        updateProfile,
        addAddress,
        editAddress,
        removeAddress,
        makeDefaultAddress,
        refreshAddresses,
        addPaymentMethod,
        editPaymentMethod,
        removePaymentMethod,
        makeDefaultPaymentMethod,
        refreshPaymentMethods,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
