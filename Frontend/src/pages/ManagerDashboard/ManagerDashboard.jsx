import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faClipboardList,
  faCircleCheck,
  faMotorcycle,
  faStore,
  faClock,
  faCreditCard,
  faRotateLeft,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import ManagerNav from "../../components/ManagerNav/ManagerNav";
import "./ManagerDashboard.css";

/* ---------------------------------------------------------
   FLUJO DE ESTADOS
   Recibido -> En preparación -> Listo
--------------------------------------------------------- */

const STATUS_FLOW = [
  { key: "received", label: "Recibido" },
  { key: "preparing", label: "En preparación" },
  { key: "ready", label: "Listo" },
];

const FILTERS = [{ key: "all", label: "Todos" }, ...STATUS_FLOW];

/* ---------------------------------------------------------
   DATOS DE PRUEBA
   Misma forma que el pedido que crea Checkout.jsx.
   Reemplazar por el servicio real cuando exista el backend.
--------------------------------------------------------- */

const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60000).toISOString();

// Lo ya entregado hoy (no aparece en el monitor).
const deliveredToday = { count: 21, revenue: 6480 };

const mockOrders = [
  {
    id: "PP-1760985010",
    status: "received",
    deliveryType: "delivery",
    customer: { name: "María Fernanda López" },
    payment: { type: "cash" },
    items: [
      { id: 1, name: "Hamburguesa clásica", quantity: 2, price: 270 },
      { id: 2, name: "Chicken fingers", quantity: 1, price: 220 },
    ],
    total: 760,
    createdAt: minutesAgo(2),
  },
  {
    id: "PP-1760985011",
    status: "received",
    deliveryType: "pickup",
    customer: { name: "Andrés Castillo" },
    payment: { type: "card", brand: "Visa", last4: "1881" },
    items: [{ id: 3, name: "Groovie Burger", quantity: 1, price: 360 }],
    total: 360,
    createdAt: minutesAgo(5),
  },
  {
    id: "PP-1760985012",
    status: "preparing",
    deliveryType: "delivery",
    customer: { name: "Carlos Mendoza" },
    payment: { type: "card", brand: "Mastercard", last4: "4242" },
    items: [
      { id: 3, name: "Groovie Burger", quantity: 2, price: 360 },
      { id: 2, name: "Chicken fingers", quantity: 1, price: 220 },
    ],
    total: 940,
    createdAt: minutesAgo(14),
  },
  {
    id: "PP-1760985013",
    status: "preparing",
    deliveryType: "delivery",
    customer: { name: "Lucía Ramírez" },
    payment: { type: "cash" },
    items: [{ id: 2, name: "Chicken fingers", quantity: 3, price: 220 }],
    total: 660,
    createdAt: minutesAgo(19),
  },
  {
    id: "PP-1760985014",
    status: "ready",
    deliveryType: "delivery",
    customer: { name: "Sofía Alvarado" },
    payment: { type: "cash" },
    items: [{ id: 1, name: "Hamburguesa clásica", quantity: 1, price: 270 }],
    total: 270,
    createdAt: minutesAgo(27),
  },
];

/* ---------------------------------------------------------
   UTILIDADES
--------------------------------------------------------- */

function formatMoney(amount) {
  return `C$${amount.toLocaleString("es-NI")}`;
}

function getTimeAgo(isoDate) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(isoDate).getTime()) / 60000)
  );

  return `Hace ${minutes} min`;
}

function getStatusIndex(status) {
  return STATUS_FLOW.findIndex((step) => step.key === status);
}

function getAdvanceLabel(order) {
  if (order.status === "received") return "Empezar a preparar";

  return order.deliveryType === "delivery"
    ? "Listo para repartidor"
    : "Listo para retiro";
}

function getWaitingLabel(order) {
  return order.deliveryType === "delivery"
    ? "Esperando repartidor"
    : "Esperando al cliente";
}

function ManagerDashboard() {
  const [orders, setOrders] = useState(mockOrders);
  const [activeFilter, setActiveFilter] = useState("all");

  const ordersTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const dailyRevenue = deliveredToday.revenue + ordersTotal;
  const readyCount = orders.filter((order) => order.status === "ready").length;

  const visibleOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((order) => order.status === activeFilter);

  function getFilterCount(filterKey) {
    if (filterKey === "all") return orders.length;

    return orders.filter((order) => order.status === filterKey).length;
  }

  function changeStatus(orderId, direction) {
    // Cuando exista backend: enviar el cambio de estado aquí.
    setOrders((currentOrders) =>
      currentOrders.map((order) => {
        if (order.id !== orderId) return order;

        const nextIndex = getStatusIndex(order.status) + direction;
        const nextStep = STATUS_FLOW[nextIndex];

        return nextStep ? { ...order, status: nextStep.key } : order;
      })
    );
  }

  return (
    <main className="manager-page">
      <section className="manager-container">

        {/* ENCABEZADO */}
        <div className="manager-header">
          <span>PANEL DEL GERENTE</span>
          <h1>Hoy en el local</h1>
          <p>
            Sigue los pedidos en cocina y revisa cómo va el día.
          </p>
        </div>

        <ManagerNav />


        {/* RESUMEN RÁPIDO */}
        <div className="manager-summary">

          <div className="manager-summary-card">
            <div className="manager-summary-icon">
              <FontAwesomeIcon icon={faMoneyBillWave} />
            </div>

            <div>
              <span>Ingresos del día</span>
              <strong>{formatMoney(dailyRevenue)}</strong>
            </div>
          </div>

          <div className="manager-summary-card">
            <div className="manager-summary-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>

            <div>
              <span>Pedidos activos</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="manager-summary-card">
            <div className="manager-summary-icon">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>

            <div>
              <span>Listos para salir</span>
              <strong>{readyCount}</strong>
            </div>
          </div>

        </div>


        {/* MONITOR DE PEDIDOS */}
        <div className="manager-section-header">
          <h2>Monitor de pedidos</h2>

          <div className="manager-filters" role="group" aria-label="Filtrar por estado">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                className={`manager-filter-button ${
                  activeFilter === filter.key ? "active" : ""
                }`}
                aria-pressed={activeFilter === filter.key}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.label}
                <span>{getFilterCount(filter.key)}</span>
              </button>
            ))}
          </div>
        </div>

        {visibleOrders.length === 0 ? (
          <div className="manager-empty">
            <FontAwesomeIcon icon={faBoxOpen} />
            <h3>No hay pedidos en este estado</h3>
            <p>Cuando llegue uno aparecerá aquí.</p>
          </div>
        ) : (
          <div className="manager-orders-grid">
            {visibleOrders.map((order) => {
              const currentIndex = getStatusIndex(order.status);
              const isReady = order.status === "ready";
              const isCash = order.payment.type === "cash";
              const isDelivery = order.deliveryType === "delivery";

              return (
                <article
                  className={`manager-order-card ${order.status}`}
                  key={order.id}
                >

                  <div className="manager-order-top">
                    <div>
                      <strong className="manager-order-number">
                        #{order.id}
                      </strong>

                      <span className="manager-order-time">
                        <FontAwesomeIcon icon={faClock} />
                        {getTimeAgo(order.createdAt)}
                      </span>
                    </div>

                    <span className="manager-type-badge">
                      <FontAwesomeIcon
                        icon={isDelivery ? faMotorcycle : faStore}
                      />
                      {isDelivery ? "Delivery" : "Retiro"}
                    </span>
                  </div>

                  <div className="manager-order-body">
                    <p className="manager-order-customer">
                      {order.customer.name}
                    </p>

                    <ul className="manager-order-items">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <strong>{item.quantity} ×</strong> {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="manager-order-meta">
                    <span
                      className={`manager-payment-badge ${
                        isCash ? "cash" : "paid"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={isCash ? faMoneyBillWave : faCreditCard}
                      />
                      {isCash ? "Efectivo" : "Pagado con tarjeta"}
                    </span>

                    <strong className="manager-order-total">
                      {formatMoney(order.total)}
                    </strong>
                  </div>

                  {/* PASOS */}
                  <ol className="manager-steps" aria-label="Estado del pedido">
                    {STATUS_FLOW.map((step, index) => (
                      <li
                        key={step.key}
                        className={`manager-step ${
                          index < currentIndex
                            ? "done"
                            : index === currentIndex
                            ? "current"
                            : ""
                        }`}
                        aria-current={index === currentIndex ? "step" : undefined}
                      >
                        {step.label}
                      </li>
                    ))}
                  </ol>

                  {/* ACCIONES */}
                  <div className="manager-order-actions">
                    <button
                      type="button"
                      className="manager-advance-button"
                      disabled={isReady}
                      onClick={() => changeStatus(order.id, 1)}
                    >
                      {isReady && <FontAwesomeIcon icon={faMotorcycle} />}
                      {isReady ? getWaitingLabel(order) : getAdvanceLabel(order)}
                    </button>

                    {currentIndex > 0 && (
                      <button
                        type="button"
                        className="manager-undo-button"
                        onClick={() => changeStatus(order.id, -1)}
                      >
                        <FontAwesomeIcon icon={faRotateLeft} />
                        Regresar un paso
                      </button>
                    )}
                  </div>

                </article>
              );
            })}
          </div>
        )}

      </section>
    </main>
  );
}

export default ManagerDashboard;
