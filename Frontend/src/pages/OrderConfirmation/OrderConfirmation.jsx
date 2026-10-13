import { Link, useLocation, Navigate } from "react-router-dom";
import "./OrderConfirmation.css";

function OrderConfirmation() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/carrito" replace />;
  }

  const paymentLabel =
    order.payment.type === "cash"
      ? "Efectivo"
      : `${order.payment.brand} •••• ${order.payment.last4}`;

  return (
    <main className="confirmation-page">
      <section className="confirmation-container">

        <div className="confirmation-header">
          <div className="confirmation-icon">✓</div>

          <span>¡TODO LISTO!</span>

          <h1>¡Pedido confirmado!</h1>

          <p>
            Hemos registrado tu pedido de prueba.
            Aquí puedes revisar sus detalles.
          </p>
        </div>

        <div className="confirmation-card">
          <div className="confirmation-order-number">
            <span>Número de pedido</span>
            <strong>#{order.id}</strong>
          </div>

          <div className="confirmation-details">
            <div>
              <span>Cliente</span>
              <strong>{order.customer.name}</strong>
            </div>

            <div>
              <span>Tipo de entrega</span>
              <strong>
                {order.deliveryType === "delivery"
                  ? "Delivery"
                  : "Retiro en local"}
              </strong>
            </div>

            {order.deliveryType === "delivery" && (
              <div>
                <span>Dirección</span>
                <strong>{order.customer.address}</strong>
              </div>
            )}

            <div>
              <span>Método de pago</span>
              <strong>{paymentLabel}</strong>
            </div>
          </div>

          <div className="confirmation-products">
            <h2>Resumen de tu pedido</h2>

            {order.items.map((item, index) => (
              <div
                className="confirmation-product"
                key={`${item.id}-${item.selectedOption || index}`}
              >
                <div>
                  <strong>
                    {item.quantity} × {item.name}
                  </strong>

                  {item.selectedOption && (
                    <small>{item.selectedOption}</small>
                  )}
                </div>

                <strong>
                  C${(item.price * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <div className="confirmation-total">
            <span>Total</span>
            <strong>C${order.total.toFixed(2)}</strong>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/" className="confirmation-home-button">
            Volver al inicio
          </Link>

          <Link to="/menu" className="confirmation-menu-button">
            Hacer otro pedido
          </Link>
        </div>

      </section>
    </main>
  );
}

export default OrderConfirmation;