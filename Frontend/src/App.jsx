import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard/DriverDashboard";
import ActiveDelivery from "./pages/ActiveDelivery/ActiveDelivery";
import ManagerDashboard from "./pages/ManagerDashboard/ManagerDashboard";
import LocalReports from "./pages/LocalReports/LocalReports";
import MenuManager from "./pages/MenuManager/MenuManager";
import KitchenDashboard from "./pages/KitchenDashboard/KitchenDashboard";

import "./App.css";

function App() {
  const location = useLocation();

  // La cocina usa pantalla completa y sin distracciones
  const hideNavbar = location.pathname.startsWith("/cocina");

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        {/* CLIENTE */}
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/pedido-confirmado" element={<OrderConfirmation />} />

        {/* ADMIN (usuario de prueba) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* REPARTIDOR */}
        <Route
          path="/repartidor"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entrega-activa"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <ActiveDelivery />
            </ProtectedRoute>
          }
        />

        {/* GERENTE */}
        <Route
          path="/gerente"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerente/reportes"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <LocalReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gerente/menu"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <MenuManager />
            </ProtectedRoute>
          }
        />

        {/* COCINA */}
        <Route
          path="/cocina"
          element={
            <ProtectedRoute allowedRoles={["kitchen"]}>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
