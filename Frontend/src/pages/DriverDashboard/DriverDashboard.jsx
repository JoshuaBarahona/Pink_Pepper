import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMotorcycle,
  faLocationDot,
  faRoute,
  faBagShopping,
  faClock,
  faMoneyBillWave,
  faCreditCard,
  faPowerOff,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import "./DriverDashboard.css";

/* ---------------------------------------------------------
   DATOS DE PRUEBA
   Misma forma que el pedido que crea Checkout.jsx.
   Reemplazar por el servicio real cuando exista el backend.
--------------------------------------------------------- */

const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60000).toISOString();

const mockPendingOrders = [
  {
    id: "PP-1760985001",
    deliveryType: "delivery",
    customer: {
      name: "María Fernanda López",
      phone: "8845 2210",
      address:
        "Residencial Altamira, del Hotel Crowne Plaza 2 c. al sur, casa #14",
      reference: "Casa azul con portón negro",
    },
    payment: { type: "cash" },
    items: [
      { id: 1, name: "Hamburguesa clásica", quantity: 2, price: 270 },
      { id: 2, name: "Chicken fingers", quantity: 1, price: 220 },
    ],
    total: 760,
    distance: "2.4 km",
    createdAt: minutesAgo(4),
  },
  {
    id: "PP-1760985002",
    deliveryType: "delivery",
    customer: {
      name: "Carlos Mendoza",
      phone: "8712 5634",
      address:
        "Villa Fontana, de la Rotonda El Güegüense 1 c. arriba, apto 3B",
      reference: "Edificio blanco, timbre del 3B",
    },
    payment: { type: "card", brand: "Visa", last4: "4242" },
    items: [{ id: 3, name: "Groovie Burger", quantity: 1, price: 360 }],
    total: 360,
    distance: "3.1 km",
    createdAt: minutesAgo(9),
  },
  {
    id: "PP-1760985003",
    deliveryType: "delivery",
    customer: {
      name: "Lucía Ramírez",
      phone: "8630 9087",
      address: "Colonia Centroamérica, de ENEL Central 3 c. al lago",
      reference: "Portón verde, preguntar por Lucía",
    },
    payment: { type: "cash" },
    items: [{ id: 2, name: "Chicken fingers", quantity: 3, price: 220 }],
    total: 660,
    distance: "1.8 km",
    createdAt: minutesAgo(12),
  },
];

function getTimeAgo(isoDate) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(isoDate).getTime()) / 60000)
  );

  return `Hace ${minutes} min`;
}

function getItemsCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function DriverDashboard() {
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(false);
  const [pendingOrders] = useState(mockPendingOrders);

  function handleToggleOnline() {
    setIsOnline((current) => !current);
  }

  function handleAcceptOrder(order) {
    // Cuando exista backend: marcar el pedido como aceptado aquí.
    navigate("/entrega-activa", {
      state: {
        order: { ...order, status: "accepted" },
      },
    });
  }

  return (
    <main className="driver-page">
      <section className="driver-container">

        {/* ENCABEZADO */}
        <div className="driver-header">
          <span>PANEL DEL REPARTIDOR</span>
          <h1>Tus entregas</h1>
          <p>
            Conéctate para ver los pedidos que están listos para salir.
          </p>
        </div>


        {/* ESTADO EN LÍNEA */}
        <div className={`driver-status ${isOnline ? "online" : ""}`}>

          <div className="driver-status-info">
            <div className="driver-status-icon">
              <FontAwesomeIcon icon={isOnline ? faMotorcycle : faPowerOff} />
            </div>

            <div>
              <strong>
                {isOnline ? "Estás en línea" : "Estás desconectado"}
              </strong>

              <span>
                {isOnline
                  ? "Puedes aceptar pedidos nuevos."
                  : "Actívate para ver pedidos disponibles."}
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isOnline}
            aria-label="Ponerme en línea"
            className={`driver-toggle ${isOnline ? "online" : ""}`}
            onClick={handleToggleOnline}
          >
            <span className="driver-toggle-knob" />
          </button>

        </div>


        {/* PEDIDOS PENDIENTES */}
        {!isOnline && (
          <div className="driver-empty">
            <FontAwesomeIcon icon={faPowerOff} />
            <h3>Sin conexión</h3>
            <p>Ponte en línea para ver los pedidos pendientes.</p>
          </div>
        )}

        {isOnline && pendingOrders.length === 0 && (
          <div className="driver-empty">
            <FontAwesomeIcon icon={faBoxOpen} />
            <h3>No hay pedidos por ahora</h3>
            <p>Cuando llegue uno nuevo aparecerá aquí.</p>
          </div>
        )}

        {isOnline && pendingOrders.length > 0 && (
          <>
            <div className="driver-section-header">
              <h2>Pedidos pendientes</h2>

              <span className="driver-count">
                {pendingOrders.length}{" "}
                {pendingOrders.length === 1 ? "disponible" : "disponibles"}
              </span>
            </div>

            <div className="driver-orders-grid">
              {pendingOrders.map((order) => {
                const isCash = order.payment.type === "cash";
                const itemsCount = getItemsCount(order.items);

                return (
                  <article className="driver-card" key={order.id}>

                    <div className="driver-card-top">
                      <div>
                        <strong className="driver-order-number">
                          #{order.id}
                        </strong>

                        <span className="driver-order-time">
                          <FontAwesomeIcon icon={faClock} />
                          {getTimeAgo(order.createdAt)}
                        </span>
                      </div>

                      <span
                        className={`driver-payment-badge ${
                          isCash ? "cash" : "paid"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={isCash ? faMoneyBillWave : faCreditCard}
                        />
                        {isCash ? "Cobrar efectivo" : "Pagado"}
                      </span>
                    </div>

                    <div className="driver-card-details">

                      <div className="driver-card-row">
                        <FontAwesomeIcon icon={faLocationDot} />
                        <p className="driver-card-address">
                          {order.customer.address}
                        </p>
                      </div>

                      <div className="driver-card-row">
                        <FontAwesomeIcon icon={faRoute} />
                        <p>{order.distance} de distancia</p>
                      </div>

                      <div className="driver-card-row">
                        <FontAwesomeIcon icon={faBagShopping} />
                        <p>
                          {itemsCount}{" "}
                          {itemsCount === 1 ? "producto" : "productos"}
                        </p>
                      </div>

                    </div>

                    <div className="driver-card-footer">
                      <div className="driver-card-total">
                        <span>Total</span>
                        <strong>C${order.total.toFixed(2)}</strong>
                      </div>

                      <button
                        type="button"
                        className="driver-accept-button"
                        onClick={() => handleAcceptOrder(order)}
                      >
                        Aceptar pedido
                      </button>
                    </div>

                  </article>
                );
              })}
            </div>
          </>
        )}

      </section>
    </main>
  );
}

export default DriverDashboard;
