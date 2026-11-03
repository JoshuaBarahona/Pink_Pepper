// Normaliza los roles del backend (en español) y del frontend (en inglés)
const ROLE_ALIASES = {
  repartidor: "driver",
  driver: "driver",
  gerente: "manager",
  manager: "manager",
  cocina: "kitchen",
  kitchen: "kitchen",
  cliente: "customer",
  customer: "customer",
  admin: "admin",
};

export function normalizeRole(role) {
  const key = String(role || "").trim().toLowerCase();
  return ROLE_ALIASES[key] || key || "customer";
}

// Solo los clientes pueden usar el carrito de compras
export function isCustomer(user) {
  return Boolean(user) && normalizeRole(user.role) === "customer";
}

