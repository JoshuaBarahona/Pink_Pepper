import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useCart, DELIVERY_FEE } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  createOrder,
  getOrderErrorMessage,
} from "../../services/orderService";
import PaymentCardForm from "../../components/PaymentCardForm/PaymentCardForm";
import "./Checkout.css";

const PICKUP_ADDRESS = "Retiro en local - Pink Pepper";

function Checkout() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState("delivery");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shippingCost = deliveryType === "delivery" ? DELIVERY_FEE : 0;
  const orderTotal = Number((cartSubtotal + shippingCost).toFixed(2));

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    const defaultAddress = user?.addresses?.find(
      (address) => address.isDefault
    );
    return defaultAddress ? String(defaultAddress.id) : "";
  });

  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const [customerData, setCustomerData] = useState(() => {
    const defaultAddress = user?.addresses?.find(
      (address) => address.isDefault
    );

    return {
      name: user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
        : "",
      phone: user?.phone?.trim() || "",
      address: defaultAddress?.address || "",
      reference: defaultAddress?.reference || "",
    };
  });

  const [paymentType, setPaymentType] = useState("cash");
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const savedPaymentMethods = user?.paymentMethods ?? [];

  const effectiveSelectedPaymentId = savedPaymentMethods.some(
    (payment) => String(payment.id) === selectedPaymentId
  )
    ? selectedPaymentId
    : String(
        (
          savedPaymentMethods.find((payment) => payment.isDefault) ??
          savedPaymentMethods[0]
        )?.id ?? ""
      );

  const selectedPayment = savedPaymentMethods.find(
    (payment) => String(payment.id) === effectiveSelectedPaymentId
  );

  function handleChange(e) {
    const { name, value } = e.target;

    setCustomerData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSelectAddress(e) {
    const addressId = e.target.value;

    setSelectedAddressId(addressId);

    const selectedAddress = user?.addresses?.find(
      (address) => String(address.id) === addressId
    );

    if (selectedAddress) {
      setCustomerData((current) => ({
        ...current,
        address: selectedAddress.address,
        reference: selectedAddress.reference || "",
      }));
    } else {
      setCustomerData((current) => ({
        ...current,
        address: "",
        reference: "",
      }));
    }
  }

  function handleSaveCheckoutPayment(newPayment) {
    if (!user) return;

    const currentPayments = user.paymentMethods ?? [];

    const paymentToSave = {
      ...newPayment,
      isDefault: currentPayments.length === 0,
    };

    updateUser({
      ...user,
      paymentMethods: [...currentPayments, paymentToSave],
    });

    setSelectedPaymentId(String(paymentToSave.id));
    setPaymentType("card");
    setShowPaymentForm(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    setSubmitError("");

    if (cart.length === 0) {
      setSubmitError("Tu carrito está vacío.");
      return;
    }

    if (paymentType === "card" && !selectedPayment) {
      setSubmitError("Selecciona una tarjeta para continuar.");
      return;
    }

    const cardLast4 = selectedPayment?.last4 || selectedPayment?.lastFour || "";
    const orderItems = cart.map((item) => ({ ...item }));

    let backendOrder = null;

    // Los clientes autenticados con JWT registran el pedido en el backend
    if (typeof user?.id === "number") {
      setIsSubmitting(true);

      try {
        backendOrder = await createOrder({
          items: cart,
          address:
            deliveryType === "delivery"
              ? customerData.address.trim()
              : PICKUP_ADDRESS,
          reference:
            deliveryType === "delivery" ? customerData.reference.trim() : "",
          notes: [
            notes.trim(),
            ...cart
              .filter((item) => item.selectedOption)
              .map((item) => `${item.name}: ${item.selectedOption}`),
          ]
            .filter(Boolean)
            .join(" | "),
          paymentMethod: paymentType === "card" ? "TARJETA" : "EFECTIVO",
          receipt:
            paymentType === "card" && selectedPayment
              ? `${selectedPayment.brand} **** ${cardLast4}`
              : "",
          shippingCost,
        });
      } catch (error) {
        setSubmitError(getOrderErrorMessage(error));
        setIsSubmitting(false);
        return;
      }
    }

    const order = {
      deliveryType,

      customer: {
        ...customerData,
        address: deliveryType === "delivery" ? customerData.address : "",
        reference: deliveryType === "delivery" ? customerData.reference : "",
      },

      payment: {
        type: paymentType,
        ...(paymentType === "card" && {
          cardId: selectedPayment.id,
          brand: selectedPayment.brand,
          last4: cardLast4,
        }),
      },

      items: orderItems,
      notes: notes.trim(),
      subtotal: cartSubtotal,
      shippingCost: backendOrder ? backendOrder.costo_envio : shippingCost,
      total: backendOrder ? backendOrder.total : orderTotal,
    };

    const confirmedOrder = {
      ...order,
      id: backendOrder ? backendOrder.id_pedido : `PP-${Date.now()}`,
      status: backendOrder ? backendOrder.estado_pedido : "confirmed",
      createdAt: backendOrder
        ? backendOrder.fecha_creacion
        : new Date().toISOString(),
      isBackendOrder: Boolean(backendOrder),
    };

    // Vaciar el carrito después de crear el pedido
    setOrderPlaced(true);
    clearCart();

    // Mostrar la confirmación con los productos originales
    navigate("/pedido-confirmado", {
      replace: true,
      state: {
        order: confirmedOrder,
      },
    });
  }

  // Sin productos no hay nada que pagar: volver al carrito
  if (cart.length === 0 && !orderPlaced) {
    return <Navigate to="/carrito" replace />;
  }

  return (
    <main className="checkout-page">
      <section className="checkout-container">
        <div className="checkout-header">
          <span>CASI LISTO</span>
          <h1>Finaliza tu pedido</h1>
          <p>Completa tus datos para continuar con tu pedido.</p>
        </div>

        <form className="checkout-content" onSubmit={handleSubmit}>
          <div className="checkout-form">
            <div className="checkout-section">
              <h2>¿Cómo quieres recibir tu pedido?</h2>

              <div className="delivery-options">
                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="delivery"
                    checked={deliveryType === "delivery"}
                    onChange={(e) => setDeliveryType(e.target.value)}
                  />
                  Delivery
                </label>

                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === "pickup"}
                    onChange={(e) => setDeliveryType(e.target.value)}
                  />
                  Retiro en local
                </label>
              </div>
            </div>

            <div className="checkout-section">
              <h2>Tus datos</h2>

              <div className="checkout-fields">
                <div>
                  <label>Nombre</label>

                  <input
                    type="text"
                    name="name"
                    value={customerData.name}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label>Teléfono</label>

                  <input
                    type="tel"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Tu número de teléfono"
                  />
                </div>
              </div>
            </div>

            {deliveryType === "delivery" && (
              <div className="checkout-section">
                <h2>Dirección de entrega</h2>

                {(user?.addresses?.length ?? 0) > 0 && (
                  <div className="checkout-address-selector">
                    <label htmlFor="savedAddress">
                      Selecciona una dirección guardada
                    </label>

                    <select
                      id="savedAddress"
                      value={selectedAddressId}
                      onChange={handleSelectAddress}
                    >
                      <option value="">Otra dirección</option>

                      {user.addresses.map((address) => (
                        <option key={address.id} value={String(address.id)}>
                          {address.label}
                          {address.isDefault ? " (Principal)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="checkout-fields">
                  <div>
                    <label>Dirección</label>

                    <input
                      type="text"
                      name="address"
                      value={customerData.address}
                      onChange={handleChange}
                      required
                      placeholder="Escribe tu dirección"
                    />
                  </div>

                  <div>
                    <label>Referencia</label>

                    <textarea
                      name="reference"
                      value={customerData.reference}
                      onChange={handleChange}
                      placeholder="Ej. Casa color azul, portón negro..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="checkout-section">
              <h2>¿Cómo deseas pagar?</h2>

              <div className="checkout-payment-options">
                <label
                  className={`checkout-payment-option ${
                    paymentType === "cash" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="cash"
                    checked={paymentType === "cash"}
                    onChange={() => setPaymentType("cash")}
                  />

                  <div>
                    <strong>Pago en efectivo</strong>
                    <p>Paga al recibir tu pedido o al retirarlo.</p>
                  </div>
                </label>

                <label
                  className={`checkout-payment-option ${
                    paymentType === "card" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentType"
                    value="card"
                    checked={paymentType === "card"}
                    onChange={() => setPaymentType("card")}
                  />

                  <div>
                    <strong>Tarjeta guardada</strong>
                    <p>Selecciona una tarjeta registrada en tu perfil.</p>
                  </div>
                </label>
              </div>

              {paymentType === "card" && (
                <div className="checkout-saved-cards">
                  <h3>Selecciona una tarjeta</h3>

                  {savedPaymentMethods.length === 0 ? (
                    <p className="checkout-payment-warning">
                      No tienes tarjetas registradas. Agrega una tarjeta.
                    </p>
                  ) : (
                    <div className="checkout-card-list">
                      {savedPaymentMethods.map((payment) => (
                        <label
                          key={payment.id}
                          className={`checkout-saved-card ${
                            effectiveSelectedPaymentId === String(payment.id)
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="selectedPayment"
                            value={String(payment.id)}
                            checked={
                              effectiveSelectedPaymentId === String(payment.id)
                            }
                            onChange={(e) =>
                              setSelectedPaymentId(e.target.value)
                            }
                          />

                          <div>
                            <strong>
                              {payment.brand} •••• {payment.last4 || payment.lastFour}
                            </strong>

                            <span>
                              Vence {payment.expirationMonth}/
                              {payment.expirationYear}
                            </span>
                          </div>

                          {payment.isDefault && (
                            <span className="checkout-card-default">
                              Principal
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {!showPaymentForm && (
                    <button
                      type="button"
                      className="checkout-add-card-button"
                      onClick={() => setShowPaymentForm(true)}
                    >
                      + Agregar nueva tarjeta
                    </button>
                  )}

                  {showPaymentForm && (
                    <div className="checkout-new-card-form">
                      <PaymentCardForm
                        onSave={handleSaveCheckoutPayment}
                        onCancel={() => setShowPaymentForm(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="order-summary">
            <h2>Tu pedido</h2>

            <div className="summary-items">
              {cart.map((item) => (
                <div
                  className="summary-item"
                  key={`${item.id}-${item.selectedOption || "default"}`}
                >
                  <div>
                    <strong>
                      {item.quantity} × {item.name}
                    </strong>

                    {item.selectedOption && (
                      <span>{item.selectedOption}</span>
                    )}
                  </div>

                  <strong>
                    C${(item.price * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>C${cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="summary-row">
              <span>Envío</span>
              <span>
                {shippingCost > 0 ? `C$${shippingCost.toFixed(2)}` : "Gratis"}
              </span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>C${orderTotal.toFixed(2)}</strong>
            </div>

            <label className="summary-notes" htmlFor="orderNotes">
              Notas para cocina (opcional)
              <textarea
                id="orderNotes"
                value={notes}
                maxLength={200}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Sin cebolla, salsa aparte..."
              />
            </label>

            {submitError && (
              <p className="checkout-error" role="alert">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              className="confirm-order-button"
              disabled={
                isSubmitting ||
                cart.length === 0 ||
                (paymentType === "card" && !selectedPayment)
              }
            >
              {isSubmitting ? "Enviando pedido..." : "Confirmar pedido"}
            </button>
          </aside>
        </form>
      </section>
    </main>
  );
}

export default Checkout;
