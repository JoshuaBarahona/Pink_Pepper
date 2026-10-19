
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  loginMockUser,
  saveUser,
  logoutUser,
} from "../services/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch (error) {
        console.error("Error cargando usuario:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  // Inicio de sesión temporal
  async function loginAsMockUser() {
    const loggedUser = await loginMockUser();

    setUser(loggedUser);

    return loggedUser;
  }

  // Actualizar datos del perfil
  function updateUser(updatedUser) {
    const savedUser = saveUser(updatedUser);

    setUser(savedUser);
  }

  // Cerrar sesión
  function logout() {
    logoutUser();
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
        loginAsMockUser,
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
