import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Menu from "./pages/Menu/Menu";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import Profile from "./pages/Profile/Profile";
import OrderConfirmation from "./pages/OrderConfirmation/OrderConfirmation";
import DriverDashboard from "./pages/DriverDashboard/DriverDashboard";
import ActiveDelivery from "./pages/ActiveDelivery/ActiveDelivery";
import ManagerDashboard from "./pages/ManagerDashboard/ManagerDashboard";
import LocalReports from "./pages/LocalReports/LocalReports";
import MenuManager from "./pages/MenuManager/MenuManager";

import "./App.css";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/gerente" element={<ManagerDashboard />} />
        <Route path="/gerente/reportes" element={<LocalReports />} />
        <Route path="/gerente/menu" element={<MenuManager />} />
        <Route path="/repartidor" element={<DriverDashboard />} />
        <Route path="/entrega-activa" element={<ActiveDelivery />} />
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/carrito" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
      </Routes>
    </>
  );
}

export default App;
