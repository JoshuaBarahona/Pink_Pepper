import { createContext, useContext, useEffect, useState } from "react";

import {
  getCurrentUser,
  loginMockUser,
  saveUser,
  logoutUser,
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

  // Inicio de sesión temporal
  async function loginAsMockUser() {
    // Evita que quede una sesión de admin activa al mismo tiempo
    logoutTestAdmin();

    const loggedUser = await loginMockUser();

    setUser(loggedUser);

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

    return adminUser;
  }

  // Actualizar datos del perfil
  function updateUser(updatedUser) {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
