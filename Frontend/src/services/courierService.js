import api from "./api";

// Consultar los pedidos asignados al repartidor autenticado
export async function getAssignedOrders(params) {
  const response = await api.get("/courier/orders", { params });
  return response.data;
}

// Consultar la capacidad/cupo activo del repartidor (máximo 2 activos)
export async function getCourierCapacity() {
  const response = await api.get("/courier/capacity");
  return response.data;
}

// Consultar detalle y ubicación de entrega de un pedido asignado
export async function getAssignedOrderById(orderId) {
  const response = await api.get(`/courier/orders/${orderId}`);
  return response.data;
}

// Actualizar estado de entrega (EN_CAMINO o ENTREGADO)
export async function updateDeliveryStatus(orderId, estadoPedido) {
  const response = await api.patch(`/courier/orders/${orderId}/status`, {
    estado_pedido: estadoPedido,
  });
  return response.data;
}

// Marcar pedido como EN_CAMINO
export async function markOrderEnCamino(orderId) {
  const response = await api.patch(`/courier/orders/${orderId}/en-camino`);
  return response.data;
}

// Marcar pedido como ENTREGADO
export async function markOrderDelivered(orderId) {
  const response = await api.patch(`/courier/orders/${orderId}/entregado`);
  return response.data;
}

