import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faLocationDot,
  faRoute,
  faUser,
  faPhone,
  faCircleInfo,
  faMoneyBillWave,
  faCreditCard,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import { markOrderDelivered } from "../../services/courierService";
import "./ActiveDelivery.css";

function ActiveDelivery() {
  const location = useLocation();
  const navigate = useNavigate();

  // El pedido llega desde DriverDashboard, igual que
  // OrderConfirmation recibe el pedido desde Checkout.
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/repartidor" replace />;
  }

  const isCash = order.payment.type === "cash";

  const itemsCount = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    order.customer.address
  )}`;

  async function handleDelivered() {
    if (order.rawId) {
      try {
        await markOrderDelivered(order.rawId);
      } catch (err) {
        console.error("Error al marcar pedido como entregado:", err);
      }
    }

    navigate("/repartidor");
  }

  return (
    <main className="active-delivery-page">
      <section className="active-delivery-container">

        {/* ENCABEZADO */}
        <div className="active-delivery-header">

          <Link to="/repartidor" className="active-delivery-back">
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver al panel
          </Link>

          <span>ENTREGA EN CURSO</span>

          <h1>Pedido #{order.id}</h1>

          <p>
            Lleva {itemsCount}{" "}
            {itemsCount === 1 ? "producto" : "productos"} a tu cliente.
          </p>

        </div>


        <div className="active-delivery-content">

          <div className="active-delivery-main">

            {/* MAPA SIMULADO */}
            <div
              className="active-delivery-map"
              role="img"
              aria-label="Mapa simulado de la ruta de entrega"
            >
              <div className="active-delivery-map-pin">
                <FontAwesomeIcon icon={faLocationDot} />
              </div>

              <span className="active-delivery-map-label">
                <FontAwesomeIcon icon={faRoute} />
                Mapa simulado
              </span>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="active-delivery-map-link"
              >
                Abrir en Maps
              </a>
            </div>


            {/* DATOS DEL CLIENTE */}
            <div className="active-delivery-section">

              <h2>Datos del cliente</h2>

              <div className="active-delivery-info">

                <div className="active-delivery-info-row">
                  <div className="active-delivery-info-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </div>

                  <div className="active-delivery-info-text">
                    <span>Nombre</span>
                    <strong>{order.customer.name}</strong>
                  </div>
                </div>

                <div className="active-delivery-info-row">
                  <div className="active-delivery-info-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>

                  <div className="active-delivery-info-text">
                    <span>Teléfono</span>
                    <strong>{order.customer.phone}</strong>
                  </div>

                  <a
                    href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
                    className="active-delivery-call"
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    Llamar
                  </a>
                </div>

                <div className="active-delivery-info-row">
                  <div className="active-delivery-info-icon">
                    <FontAwesomeIcon icon={faLocationDot} />
                  </div>

                  <div className="active-delivery-info-text">
                    <span>Dirección</span>
                    <strong>{order.customer.address}</strong>
                  </div>
                </div>

                {order.customer.reference && (
                  <div className="active-delivery-info-row">
                    <div className="active-delivery-info-icon">
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </div>

                    <div className="active-delivery-info-text">
                      <span>Referencia</span>
                      <strong>{order.customer.reference}</strong>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>


          {/* MÉTODO DE PAGO */}
          <aside
            className={`active-delivery-section active-delivery-payment ${
              isCash ? "cash" : "paid"
            }`}
          >

            <h2>Método de pago</h2>

            <div className="active-delivery-payment-method">
              <div className="active-delivery-info-icon">
                <FontAwesomeIcon
                  icon={isCash ? faMoneyBillWave : faCreditCard}
                />
              </div>

              <strong>
                {isCash
                  ? "Efectivo"
                  : `${order.payment.brand} •••• ${order.payment.last4}`}
              </strong>
            </div>

            <div className="active-delivery-payment-amount">
              <span>{isCash ? "Cobra al entregar" : "Total del pedido"}</span>
              <strong>C${order.total.toFixed(2)}</strong>
            </div>

            {isCash ? (
              <p className="active-delivery-payment-note">
                Recibe el dinero antes de dejar el pedido.
              </p>
            ) : (
              <p className="active-delivery-payment-note paid">
                <FontAwesomeIcon icon={faCircleCheck} />
                Ya está pagado. No cobres nada al cliente.
              </p>
            )}

          </aside>

        </div>


        {/* BOTÓN FIJO INFERIOR */}
        <div className="active-delivery-footer">
          <button
            type="button"
            className="active-delivery-deliver-button"
            onClick={handleDelivered}
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            Marcar como entregado
          </button>
        </div>

      </section>
    </main>
  );
}

export default ActiveDelivery;
