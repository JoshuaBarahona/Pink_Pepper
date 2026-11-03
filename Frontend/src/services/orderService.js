import api from "./api";

// Envía el carrito del cliente al backend para crear el pedido.
// El backend recalcula precios, asigna repartidor y deja el estado en RECIBIDO.
export async function createOrder({
  items,
  address,
  reference,
  notes,
  paymentMethod,
  receipt,
  shippingCost,
}) {
  // Agrupa las líneas del mismo producto (p. ej. distintas opciones)
  const quantities = new Map();
  for (const item of items) {
    quantities.set(item.id, (quantities.get(item.id) || 0) + item.quantity);
  }

  const response = await api.post("/orders", {
    items: [...quantities].map(([id, cantidad]) => ({
      id_producto: Number(id),
      cantidad,
    })),
    direccion: address,
    referencia: reference || undefined,
    notas_cliente: notes || undefined,
    metodo_pago: paymentMethod,
    comprobante: receipt || undefined,
    costo_envio: shippingCost,
  });

  return response.data;
}

// Extrae un mensaje legible de los errores del backend
export function getOrderErrorMessage(error) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string") return message;

  return "No se pudo registrar tu pedido. Intenta nuevamente.";
}

// Consultar pedidos del cliente autenticado
export async function getMyOrders(params) {
  const response = await api.get("/orders/my-orders", { params });
  return response.data;
}

// Consultar todos los pedidos cronológicamente (GERENTE y ADMIN)
export async function getAllOrders(params) {
  const response = await api.get("/orders/all", { params });
  return response.data;
}

// Consultar pedidos pendientes para cocina (COCINA y ADMIN)
export async function getKitchenOrders(params) {
  const response = await api.get("/orders/kitchen", { params });
  return response.data;
}

// Consultar detalle de un pedido por id
export async function getOrderById(orderId) {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
}

// Actualizar estado del pedido (COCINA: RECIBIDO -> EN_PREPARACION -> LISTO_PARA_REPARTIDOR)
export async function updateOrderStatus(orderId, estadoPedido) {
  const response = await api.patch(`/orders/${orderId}/status`, {
    estado_pedido: estadoPedido,
  });
  return response.data;
}

