// src/context/OrderContext.jsx
import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

// Pedidos falsos iniciales para probar el Frontend
const initialOrders = [
  {
    id: "ORD-001",
    customerName: "Joshua",
    address: "Calle Falsa 123",
    items: ["Waffle de Fresa", "Café Latte"],
    total: 150,
    status: "pendiente", // pendiente, en_camino, entregado
    driverId: null,
  },
  {
    id: "ORD-002",
    customerName: "María",
    address: "Av. Siempre Viva 742",
    items: ["Pancakes Clásicos", "Jugo de Naranja"],
    total: 120,
    status: "pendiente",
    driverId: null,
  }
];

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(initialOrders);

  // Función para que el repartidor acepte un pedido
  function assignOrder(orderId, driverId) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? { ...order, status: "en_camino", driverId }
          : order
      )
    );
  }

  // Función para completar entrega
  function completeOrder(orderId) {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: "entregado" } : order
      )
    );
  }

  // Función para agregar un pedido (cuando el cliente hace checkout)
  function addOrder(newOrder) {
    setOrders((current) => [
      ...current,
      { ...newOrder, id: `ORD-${Date.now()}`, status: "pendiente" }
    ]);
  }

  return (
    <OrderContext.Provider value={{ orders, assignOrder, completeOrder, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrderContext);
}