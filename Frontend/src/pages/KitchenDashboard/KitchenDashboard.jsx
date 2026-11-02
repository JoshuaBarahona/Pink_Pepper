import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPepperHot,
  faClock,
  faFire,
  faCircleCheck,
  faCircleExclamation,
  faInbox,
  faBowlRice,
  faRotateLeft,
  faArrowLeft,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../../context/AuthContext";
import "./KitchenDashboard.css";

/* ---------------------------------------------------------
   CONFIGURACIÓN
--------------------------------------------------------- */

// A partir de estos minutos el ticket se marca como atrasado
const LATE_AFTER_MINUTES = 15;

// Segundos que se puede deshacer un despacho
const UNDO_SECONDS = 8;

/* ---------------------------------------------------------
   DATOS DE PRUEBA
   La cocina solo recibe lo necesario para cocinar:
   número, productos, cantidades y opciones. Sin precios,
   direcciones, ni método de pago.

   Estados: "received" (entrante), "preparing" (en preparación)
   y "ready" (despachado, sale del tablero). Son los mismos que
   usa el Panel del Gerente. Checkout crea los pedidos como
   "confirmed"; al conectar el backend se mapea a "received".
--------------------------------------------------------- */

const minutesAgo = (minutes) =>
  new Date(Date.now() - minutes * 60000).toISOString();

const mockOrders = [
  {
    id: "PP-1761864528472",
    status: "received",
    createdAt: minutesAgo(1),
    items: [
      { id: 1, name: "Hamburguesa clásica", quantity: 2, selectedOption: "Término medio" },
      { id: 2, name: "Chicken fingers", quantity: 1, selectedOption: "Salsa BBQ" },
    ],
  },
  {
    id: "PP-1761864528159",
    status: "received",
    createdAt: minutesAgo(4),
    items: [
      { id: 3, name: "Groovie Burger", quantity: 1, selectedOption: "Término tres cuartos" },
    ],
  },
  {
    id: "PP-1761864526027",
    status: "received",
    createdAt: minutesAgo(6),
    items: [
      { id: 2, name: "Chicken fingers", quantity: 3, selectedOption: "Salsa ranch" },
      { id: 7, name: "Limonada de fresa", quantity: 3 },
    ],
  },
  {
    id: "PP-1761864524410",
    status: "preparing",
    createdAt: minutesAgo(11),
    items: [
      { id: 3, name: "Groovie Burger", quantity: 2, selectedOption: "Bien cocida" },
      { id: 1, name: "Hamburguesa clásica", quantity: 1, selectedOption: "Término medio" },
    ],
  },
  {
    id: "PP-1761864519086",
    status: "preparing",
    createdAt: minutesAgo(17),
    items: [
      { id: 2, name: "Chicken fingers", quantity: 2, selectedOption: "Salsa BBQ" },
    ],
  },
];

/* ---------------------------------------------------------
   UTILIDADES
--------------------------------------------------------- */

// Los ids reales son largos (PP-1761864528472). En cocina se
// muestran los últimos 4 dígitos para poder leerlos de lejos.
function getTicketNumber(id) {
  return `PP-${id.slice(-4)}`;
}

function getElapsedMinutes(isoDate, now) {
  return Math.max(0, Math.floor((now - new Date(isoDate).getTime()) / 60000));
}

function formatElapsed(minutes) {
  if (minutes < 1) return "Recién llegado";
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `Hace ${hours} h` : `Hace ${hours} h ${rest} min`;
}

function sortByOldest(a, b) {
  return new Date(a.createdAt) - new Date(b.createdAt);
}

/* ---------------------------------------------------------
   TICKET (COMANDA)
--------------------------------------------------------- */

function KitchenTicket({ order, now, onStart, onDispatch }) {
  const isPreparing = order.status === "preparing";
  const minutes = getElapsedMinutes(order.createdAt, now);
  const isLate = minutes >= LATE_AFTER_MINUTES;

  return (
    <article
      className={`kitchen-ticket ${isPreparing ? "preparing" : "incoming"}`}
    >

      <div className="kitchen-ticket-top">
        <strong className="kitchen-ticket-number">
          #{getTicketNumber(order.id)}
        </strong>

        <span className={`kitchen-ticket-time ${isLate ? "late" : ""}`}>
          <FontAwesomeIcon icon={isLate ? faCircleExclamation : faClock} />
          {formatElapsed(minutes)}
        </span>
      </div>

      <ul className="kitchen-ticket-items">
        {order.items.map((item) => (
          <li
            className="kitchen-item"
            key={`${item.id}-${item.selectedOption || "default"}`}
          >
            <span className="kitchen-item-qty">{item.quantity}×</span>

            <div className="kitchen-item-info">
              <strong>{item.name}</strong>

              {item.selectedOption && (
                <span className="kitchen-item-option">
                  <FontAwesomeIcon icon={faCircleExclamation} />
                  {item.selectedOption}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {isPreparing ? (
        <button
          type="button"
          className="kitchen-action-button dispatch"
          onClick={() => onDispatch(order)}
        >
          <FontAwesomeIcon icon={faCircleCheck} />
          Marcar como listo / Despachar
        </button>
      ) : (
        <button
          type="button"
          className="kitchen-action-button start"
          onClick={() => onStart(order)}
        >
          <FontAwesomeIcon icon={faFire} />
          Comenzar a preparar
        </button>
      )}

    </article>
  );
}

/* ---------------------------------------------------------
   TABLERO
--------------------------------------------------------- */

function KitchenDashboard() {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAuth();

  const [orders, setOrders] = useState(mockOrders);
  const [now, setNow] = useState(() => Date.now());
  const [lastDispatched, setLastDispatched] = useState(null);

  // Actualiza el reloj y los tiempos transcurridos
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);

    return () => clearInterval(timer);
  }, []);

  // Oculta el aviso de "Deshacer" pasados unos segundos
  useEffect(() => {
    if (!lastDispatched) return;

    const timer = setTimeout(
      () => setLastDispatched(null),
      UNDO_SECONDS * 1000
    );

    return () => clearTimeout(timer);
  }, [lastDispatched]);

  const incomingOrders = orders
    .filter((order) => order.status === "received")
    .sort(sortByOldest);

  const preparingOrders = orders
    .filter((order) => order.status === "preparing")
    .sort(sortByOldest);

  function updateStatus(orderId, nextStatus) {
    // Cuando exista backend: enviar el cambio de estado aquí.
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );
  }

  function handleStart(order) {
    updateStatus(order.id, "preparing");
  }

  function handleDispatch(order) {
    updateStatus(order.id, "ready");
    setLastDispatched(order);
  }

  function handleUndo() {
    if (!lastDispatched) return;

    updateStatus(lastDispatched.id, "preparing");
    setLastDispatched(null);
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const clock = new Date(now).toLocaleTimeString("es-NI", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="kitchen-page">

      {/* BARRA SUPERIOR */}
      <header className="kitchen-topbar">

        <div className="kitchen-brand">
          <FontAwesomeIcon icon={faPepperHot} />
          <span>COCINA</span>
        </div>

        <div className="kitchen-topbar-right">
          <span className="kitchen-clock">{clock}</span>

          {isAdmin ? (
            <Link to="/admin" className="kitchen-exit-button">
              <FontAwesomeIcon icon={faArrowLeft} />
              Panel admin
            </Link>
          ) : (
            <button
              type="button"
              className="kitchen-exit-button"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faRightFromBracket} />
              Cerrar sesión
            </button>
          )}
        </div>

      </header>


      {/* COLUMNAS */}
      <div className="kitchen-board">

        {/* PEDIDOS ENTRANTES */}
        <section
          className="kitchen-column"
          aria-labelledby="kitchen-incoming-title"
        >
          <div className="kitchen-column-header incoming">
            <h2 id="kitchen-incoming-title">Pedidos entrantes</h2>
            <span className="kitchen-column-count">
              {incomingOrders.length}
            </span>
          </div>

          <div className="kitchen-column-body">
            {incomingOrders.length === 0 ? (
              <div className="kitchen-empty">
                <FontAwesomeIcon icon={faInbox} />
                <p>No hay pedidos pendientes</p>
              </div>
            ) : (
              incomingOrders.map((order) => (
                <KitchenTicket
                  key={order.id}
                  order={order}
                  now={now}
                  onStart={handleStart}
                  onDispatch={handleDispatch}
                />
              ))
            )}
          </div>
        </section>


        {/* EN PREPARACIÓN */}
        <section
          className="kitchen-column"
          aria-labelledby="kitchen-preparing-title"
        >
          <div className="kitchen-column-header preparing">
            <h2 id="kitchen-preparing-title">En preparación</h2>
            <span className="kitchen-column-count">
              {preparingOrders.length}
            </span>
          </div>

          <div className="kitchen-column-body">
            {preparingOrders.length === 0 ? (
              <div className="kitchen-empty">
                <FontAwesomeIcon icon={faBowlRice} />
                <p>Nada en preparación</p>
              </div>
            ) : (
              preparingOrders.map((order) => (
                <KitchenTicket
                  key={order.id}
                  order={order}
                  now={now}
                  onStart={handleStart}
                  onDispatch={handleDispatch}
                />
              ))
            )}
          </div>
        </section>

      </div>


      {/* AVISO PARA DESHACER */}
      {lastDispatched && (
        <div className="kitchen-undo" role="status">
          <span>
            #{getTicketNumber(lastDispatched.id)} despachado
          </span>

          <button
            type="button"
            className="kitchen-undo-button"
            onClick={handleUndo}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
            Deshacer
          </button>
        </div>
      )}

    </main>
  );
}

export default KitchenDashboard;
