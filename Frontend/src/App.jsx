import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";
import PaymentMethods from "./pages/PaymentMethods/PaymentMethods";

import DriverDashboard from "./pages/Driver/DriverDashboard";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas de Cliente (Protegidas) */}
        <Route path="/carrito" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/pedido-confirmado" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/metodos-pago" element={<ProtectedRoute><PaymentMethods /></ProtectedRoute>} />

        <Route path="/repartidor" element={ <ProtectedRoute allowedRoles={["repartidor", "admin"]}> <DriverDashboard /> </ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;