import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faClipboardList,
  faCircleCheck,
  faMotorcycle,
  faStore,
  faClock,
  faCreditCard,
  faBoxOpen,
  faInbox,
  faFire,
  faHourglassHalf,
  faFlask,
  faForwardStep,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

import { getAllOrders } from "../../services/orderService";
import ManagerNav from "../../components/ManagerNav/ManagerNav";
import "./ManagerDashboard.css";

/* ---------------------------------------------------------
   ETAPAS DEL PEDIDO (SOLO LECTURA PARA EL GERENTE)

   received   -> preparing -> ready       : los mueve Cocina
   ready      -> delivering -> completed  : los mueve el Repartidor
   (en pedidos de retiro: ready -> completed)

   El gerente solo ve en qué etapa va cada pedido.
--------------------------------------------------------- */

const STAGES = {
  received: { label: "Recibido", icon: faInbox },
  preparing: { label: "En preparación", icon: faFire },
  ready: { label: "Listo", icon: faBoxOpen },
  delivering: { label: "En camino", icon: faMotorcycle },
  completed: { label: "Entregado", icon: faCircleCheck },
};

const DELIVERY_FLOW = [
  "received",
  "preparing",
  "ready",
  "delivering",
  "completed",
];

const PICKUP_FLOW = ["received", "preparing", "ready", "completed"];

const FILTERS = [
  { key: "all", label: "Todos" },
  ...Object.entries(STAGES).map(([key, stage]) => ({
    key,
    label: stage.label,
  })),
];

/* ---------------------------------------------------------
   ESTADO DEL PAGO

   Tarjeta  -> "paid" desde que entra el pedido.
   Efectivo -> "pending" hasta que el pedido pasa a
               "completed" (lo marca el repartidor al entregar);
               en ese momento pasa solo a "paid".
--------------------------------------------------------- */

const PAYMENT_STATUS = {
  paid: { label: "Pagado", icon: faCircleCheck },
  pending: { label: "Pendiente de cobro", icon: faHourglassHalf },
};

/* ---------------------------------------------------------
   MODO DE PRUEBA
   Mientras Cocina y Repartidor no actualicen los pedidos de
   verdad, este panel simula sus acciones para ver cómo cambian
   las etapas, el estado de pago y los ingresos.
   Ponerlo en false cuando exista el backend.
--------------------------------------------------------- */

const SHOW_TEST_SIMULATOR = true;

/* ---------------------------------------------------------
   DATOS DE PRUEBA
   Misma forma que el pedido que crea Checkout.jsx, más
   `paymentStatus`. Reemplazar por el servicio real cuando
   exista el backend.
--------------------------------------------------------- */

const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60000).toISOString();

function buildMockOrders() {
  return [
    {
      id: "PP-1761864530001",
      status: "received",
      paymentStatus: "pending",
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
      id: "PP-1761864530002",
      status: "preparing",
      paymentStatus: "paid",
      deliveryType: "pickup",
      customer: { name: "Andrés Castillo" },
      payment: { type: "card", brand: "Visa", last4: "1881" },
      items: [
        { id: 3, name: "Groovie Burger", quantity: 1, price: 360 },
        { id: 7, name: "Limonada de fresa", quantity: 2, price: 75 },
      ],
      total: 510,
      createdAt: minutesAgo(9),
    },
    {
      id: "PP-1761864530003",
      status: "preparing",
      paymentStatus: "paid",
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
      id: "PP-1761864530004",
      status: "ready",
      paymentStatus: "pending",
      deliveryType: "delivery",
      customer: { name: "Lucía Ramírez" },
      payment: { type: "cash" },
      items: [{ id: 2, name: "Chicken fingers", quantity: 3, price: 220 }],
      total: 660,
      createdAt: minutesAgo(22),
    },
    {
      id: "PP-1761864530005",
      status: "delivering",
      paymentStatus: "pending",
      deliveryType: "delivery",
      customer: { name: "Sofía Alvarado" },
      payment: { type: "cash" },
      items: [
        { id: 1, name: "Hamburguesa clásica", quantity: 1, price: 270 },
        { id: 5, name: "Alitas BBQ", quantity: 1, price: 250 },
      ],
      total: 520,
      createdAt: minutesAgo(31),
    },
    {
      id: "PP-1761864530006",
      status: "delivering",
      paymentStatus: "paid",
      deliveryType: "delivery",
      customer: { name: "Diego Romero" },
      payment: { type: "card", brand: "Visa", last4: "7710" },
      items: [
        { id: 1, name: "Hamburguesa clásica", quantity: 2, price: 270 },
        { id: 7, name: "Limonada de fresa", quantity: 2, price: 75 },
      ],
      total: 690,
      createdAt: minutesAgo(36),
    },
    {
      id: "PP-1761864530007",
      status: "completed",
      paymentStatus: "paid",
      deliveryType: "delivery",
      customer: { name: "Valeria Blandón" },
      payment: { type: "cash" },
      items: [
        { id: 3, name: "Groovie Burger", quantity: 1, price: 360 },
        { id: 5, name: "Alitas BBQ", quantity: 1, price: 250 },
      ],
      total: 610,
      createdAt: minutesAgo(52),
    },
    {
      id: "PP-1761864530008",
      status: "completed",
      paymentStatus: "paid",
      deliveryType: "pickup",
      customer: { name: "Marcos Téllez" },
      payment: { type: "card", brand: "Visa", last4: "3355" },
      items: [{ id: 2, name: "Chicken fingers", quantity: 2, price: 220 }],
      total: 440,
      createdAt: minutesAgo(64),
    },
  ];
}

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

function getFlow(order) {
  return order.deliveryType === "delivery" ? DELIVERY_FLOW : PICKUP_FLOW;
}

function getStageLabel(order) {
  if (order.status === "ready") {
    return order.deliveryType === "delivery"
      ? "Listo para repartidor"
      : "Listo para retiro";
  }

  return STAGES[order.status].label;
}

// Simula el siguiente paso que daría Cocina o el Repartidor.
// El efectivo pasa a "paid" al llegar a "completed".
function advanceOrder(order) {
  const flow = getFlow(order);
  const nextStatus = flow[flow.indexOf(order.status) + 1];

  if (!nextStatus) return order;

  const isCash = order.payment.type === "cash";

  return {
    ...order,
    status: nextStatus,
    paymentStatus:
      isCash && nextStatus === "completed" ? "paid" : order.paymentStatus,
  };
}

const BACKEND_STAGE_MAP = {
  RECIBIDO: "received",
  EN_PREPARACION: "preparing",
  LISTO_PARA_REPARTIDOR: "ready",
  EN_CAMINO: "delivering",
  ENTREGADO: "completed",
};

function mapBackendManagerOrder(order) {
  const cliente = order.cliente || {};
  const status = BACKEND_STAGE_MAP[order.estado_pedido] || "received";
  const isPaid =
    order.metodo_pago === "TARJETA" || order.estado_pedido === "ENTREGADO";

  return {
    id: String(order.id_pedido),
    rawId: order.id_pedido,
    status,
    paymentStatus: isPaid ? "paid" : "pending",
    deliveryType: order.direccion?.toLowerCase().includes("retiro")
      ? "pickup"
      : "delivery",
    customer: {
      name:
        [cliente.primer_nombre, cliente.primer_apellido]
          .filter(Boolean)
          .join(" ") || "Cliente",
    },
    payment: {
      type: order.metodo_pago === "TARJETA" ? "card" : "cash",
      brand: "Tarjeta",
      last4: "",
    },
    items: (order.detalles || []).map((d) => ({
      id: d.id_producto,
      name: d.nombre_producto,
      quantity: d.cantidad,
      price: d.precio_unitario,
    })),
    total: order.total,
    createdAt: order.fecha_creacion,
  };
}

function ManagerDashboard() {
  const [orders, setOrders] = useState(buildMockOrders);
  const [activeFilter, setActiveFilter] = useState("all");
  const [simulatedId, setSimulatedId] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchAll() {
      try {
        const data = await getAllOrders();
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setOrders(data.map(mapBackendManagerOrder));
        }
      } catch (err) {
        console.error("Error cargando pedidos para el gerente:", err);
      }
    }
    fetchAll();
    const interval = setInterval(fetchAll, 20000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  /* MÉTRICAS */
  const dailyRevenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  const pendingAmount = orders
    .filter((order) => order.paymentStatus === "pending")
    .reduce((sum, order) => sum + order.total, 0);

  const activeCount = orders.filter(
    (order) => order.status !== "completed"
  ).length;

  const readyCount = orders.filter((order) => order.status === "ready").length;

  /* LISTA: los pedidos entregados van al final */
  const visibleOrders = orders
    .filter((order) =>
      activeFilter === "all" ? true : order.status === activeFilter
    )
    .sort(
      (a, b) =>
        Number(a.status === "completed") - Number(b.status === "completed")
    );

  function getFilterCount(filterKey) {
    if (filterKey === "all") return orders.length;

    return orders.filter((order) => order.status === filterKey).length;
  }

  /* SIMULADOR */
  const simulatableOrders = orders.filter(
    (order) => order.status !== "completed"
  );

  const selectedSimId = simulatableOrders.some(
    (order) => order.id === simulatedId
  )
    ? simulatedId
    : simulatableOrders[0]?.id ?? "";

  function handleSimulateAdvance() {
    if (!selectedSimId) return;

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === selectedSimId ? advanceOrder(order) : order
      )
    );
  }

  function handleResetOrders() {
    setOrders(buildMockOrders());
    setSimulatedId("");
  }

  return (
    <main className="manager-page">
      <section className="manager-container">

        {/* ENCABEZADO */}
        <div className="manager-header">
          <span>PANEL DEL GERENTE</span>
          <h1>Hoy en el local</h1>
          <p>
            Sigue en qué etapa va cada pedido y cuánto dinero ya entró.
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
              <small>
                {pendingAmount > 0
                  ? `${formatMoney(pendingAmount)} pendientes de cobro`
                  : "Todo cobrado"}
              </small>
            </div>
          </div>

          <div className="manager-summary-card">
            <div className="manager-summary-icon">
              <FontAwesomeIcon icon={faClipboardList} />
            </div>

            <div>
              <span>Pedidos activos</span>
              <strong>{activeCount}</strong>
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


        {/* SIMULADOR (SOLO PRUEBAS) */}
        {SHOW_TEST_SIMULATOR && (
          <div className="manager-simulator">

            <div className="manager-simulator-text">
              <strong>
                <FontAwesomeIcon icon={faFlask} />
                MODO DE PRUEBA
              </strong>

              <span>
                Simula lo que harían Cocina y el Repartidor. El gerente
                solo ve el resultado.
              </span>
            </div>

            <div className="manager-simulator-controls">
              <select
                className="manager-simulator-select"
                aria-label="Pedido a avanzar"
                value={selectedSimId}
                onChange={(e) => setSimulatedId(e.target.value)}
                disabled={simulatableOrders.length === 0}
              >
                {simulatableOrders.length === 0 && (
                  <option value="">Todos entregados</option>
                )}

                {simulatableOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    #{order.id} ({getStageLabel(order)},{" "}
                    {order.payment.type === "cash" ? "efectivo" : "tarjeta"})
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="manager-simulator-button"
                onClick={handleSimulateAdvance}
                disabled={!selectedSimId}
              >
                <FontAwesomeIcon icon={faForwardStep} />
                Avanzar estado
              </button>

              <button
                type="button"
                className="manager-simulator-button secondary"
                onClick={handleResetOrders}
              >
                <FontAwesomeIcon icon={faRotateLeft} />
                Reiniciar
              </button>
            </div>

          </div>
        )}


        {/* MONITOR DE PEDIDOS */}
        <div className="manager-section-header">
          <h2>Monitor de pedidos</h2>

          <div className="manager-filters" role="group" aria-label="Filtrar por etapa">
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
            <h3>No hay pedidos en esta etapa</h3>
            <p>Cuando llegue uno aparecerá aquí.</p>
          </div>
        ) : (
          <div className="manager-orders-grid">
            {visibleOrders.map((order) => {
              const flow = getFlow(order);
              const currentIndex = flow.indexOf(order.status);
              const stage = STAGES[order.status];

              const isCash = order.payment.type === "cash";
              const isDelivery = order.deliveryType === "delivery";
              const paymentStatus = PAYMENT_STATUS[order.paymentStatus];

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

                  {/* PAGO: método y estado del dinero */}
                  <div className="manager-order-meta">
                    <div className="manager-payment">
                      <span className="manager-payment-method">
                        <FontAwesomeIcon
                          icon={isCash ? faMoneyBillWave : faCreditCard}
                        />
                        {isCash ? "Efectivo" : "Tarjeta"}
                      </span>

                      <span
                        className={`manager-payment-status ${order.paymentStatus}`}
                      >
                        <FontAwesomeIcon icon={paymentStatus.icon} />
                        {paymentStatus.label}
                      </span>
                    </div>

                    <strong className="manager-order-total">
                      {formatMoney(order.total)}
                    </strong>
                  </div>

                  {/* ETAPA (SOLO LECTURA) */}
                  <div className="manager-stage">
                    <span className={`manager-stage-badge ${order.status}`}>
                      <FontAwesomeIcon icon={stage.icon} />
                      {getStageLabel(order)}
                    </span>

                    <div className="manager-progress" aria-hidden="true">
                      {flow.map((stageKey, index) => (
                        <span
                          key={stageKey}
                          className={`manager-progress-segment ${
                            index <= currentIndex ? "filled" : ""
                          }`}
                        />
                      ))}
                    </div>
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
