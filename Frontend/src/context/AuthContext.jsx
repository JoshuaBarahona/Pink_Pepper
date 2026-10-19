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
  registerUser,
  loginUser,
} from "../services/userService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [welcomeTrigger, setWelcomeTrigger] = useState(0);

  // Registrar un usuario
  async function register(userData) {
  const registeredUser = await registerUser(userData);
  setUser(registeredUser);
  setWelcomeTrigger((current) => current + 1);
  return registeredUser;
}

  // Iniciar sesión
  async function login(email, password) {
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

  // Inicio de sesión temporal con usuario de prueba
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
