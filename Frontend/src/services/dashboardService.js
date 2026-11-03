import api from "./api";

// Consolidado completo de métricas del dashboard (GERENTE)
export async function getDashboardMetrics() {
  const response = await api.get("/dashboard");
  return response.data;
}

// Métricas de pedidos realizados (GERENTE)
export async function getOrdersMetrics() {
  const response = await api.get("/dashboard/orders");
  return response.data;
}

// Tiempos promedio de entrega y carga activa por repartidor (GERENTE)
export async function getCouriersAverageTime() {
  const response = await api.get("/dashboard/couriers");
  return response.data;
}

// Ganancias de la última semana día por día (GERENTE)
export async function getWeeklyEarnings() {
  const response = await api.get("/dashboard/earnings");
  return response.data;
}

