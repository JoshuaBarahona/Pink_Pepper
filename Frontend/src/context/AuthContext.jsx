import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  loginMockUser,
  saveUser,
  logoutUser,
  registerUser,
  loginUser,
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
    setUser(registeredUser);
    setWelcomeTrigger((current) => current + 1);
    return registeredUser;
  }

  // Iniciar sesión (soporta tanto admin de prueba como usuarios registrados)
  async function login(email, password) {
    const adminUser = loginTestAdmin(email, password);

    if (adminUser) {
      logoutUser();
      setUser(adminUser);
      setWelcomeTrigger((current) => current + 1);
      return adminUser;
    }

    logoutTestAdmin();

    const loggedUser = await loginUser(email, password);
    setUser(loggedUser);
    setWelcomeTrigger((current) => current + 1);
    return loggedUser;
  }

  // Cargar la sesión existente
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        // Si no hay usuario normal, se revisa si quedó una sesión de admin
        setUser(currentUser ?? getAdminSession());
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
