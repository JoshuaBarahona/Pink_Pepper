import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import PaymentCardForm from "../../components/PaymentCardForm/PaymentCardForm";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
    const { cart, cartSubtotal, clearCart } = useCart();
    const { user, loadingUser, updateUser } = useAuth();
    
    const [deliveryType, setDeliveryType] = useState("delivery");

    const [selectedAddressId, setSelectedAddressId] = useState("");

    const [showPaymentForm, setShowPaymentForm] = useState(false);

    const navigate = useNavigate();

    const [customerData, setCustomerData] = useState({
        name: "",
        phone: "",
        address: "",
        reference: "",
    });

    const [paymentType, setPaymentType] = useState("cash");
    const [selectedPaymentId, setSelectedPaymentId] = useState("");

    const savedPaymentMethods = user?.paymentMethods ?? [];

const defaultPayment = savedPaymentMethods.find(
  (payment) => payment.isDefault
);

useEffect(() => {
  if (!user) return;

  const payments = user.paymentMethods ?? [];

  setSelectedPaymentId((currentId) => {
    const currentStillExists = payments.some(
      (payment) => String(payment.id) === currentId
    );

    if (currentStillExists) {
      return currentId;
    }

    const defaultCard =
      payments.find((payment) => payment.isDefault) ??
      payments[0];

    return defaultCard ? String(defaultCard.id) : "";
  });
}, [user]);

const selectedPayment = savedPaymentMethods.find(
  (payment) => String(payment.id) === selectedPaymentId
);

    useEffect(() => {
  if (!user) return;

  const defaultAddress = user.addresses?.find(
    (address) => address.isDefault
  );

  setCustomerData({
    name: `${user.firstName} ${user.lastName}`.trim(),
    phone: user.phone || "",
    address: defaultAddress?.address || "",
    reference: defaultAddress?.reference || "",
  });

  setSelectedAddressId(
    defaultAddress ? String(defaultAddress.id) : ""
  );
}, [user]);

    function handleChange(e){
        const { name, value } = e.target;

        setCustomerData((currentData) => ({
            ...currentData,
            [name]: value,
        }));
    }

    function handleSelectAddress(e) {
  const addressId = e.target.value;

  setSelectedAddressId(addressId);

  const selectedAddress = user.addresses?.find(
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
    paymentMethods: [
      ...currentPayments,
      paymentToSave,
    ],
  });

  setSelectedPaymentId(String(paymentToSave.id));
  setPaymentType("card");
  setShowPaymentForm(false);
}

    function handleSubmit(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  if (paymentType === "card" && !selectedPayment) {
    alert("Selecciona una tarjeta para continuar.");
    return;
  }

  const order = {
    deliveryType,

    customer: {
      ...customerData,
      address:
        deliveryType === "delivery"
          ? customerData.address
          : "",
      reference:
        deliveryType === "delivery"
          ? customerData.reference
          : "",
    },

    payment: {
      type: paymentType,
      ...(paymentType === "card" && {
        cardId: selectedPayment.id,
        brand: selectedPayment.brand,
        last4: selectedPayment.last4,
      }),
    },

    items: cart,
    subtotal: cartSubtotal,
    total: cartSubtotal,
    status: "pending",
  };

  const confirmedOrder = {
  ...order,
  items: cart.map((item) => ({ ...item })),
  id: `PP-${Date.now()}`,
  status: "confirmed",
  createdAt: new Date().toISOString(),
};

console.log("Pedido de prueba:", confirmedOrder);

// Vaciar el carrito después de crear el pedido de prueba
clearCart();

// Mostrar la confirmación con los productos originales
navigate("/pedido-confirmado", {
  state: {
    order: confirmedOrder,
  },
});

    }

    return(

        <main className="checkout-page">

      <section className="checkout-container">

        <div className="checkout-header">
          /*PRUEBA*/
<Link
  to="/perfil"
  style={{
    display: "inline-block",
    marginBottom: "20px",
    color: "#D94F70",
    fontWeight: "bold",
  }}
>
  Ir a Mi perfil (prueba)
</Link>
          <span>CASI LISTO</span>
          <h1>Finaliza tu pedido</h1>
          <p>
            Completa tus datos para continuar con tu pedido.
          </p>
        </div>

        <form
          className="checkout-content"
          onSubmit={handleSubmit}
        >

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
                    onChange={(e) =>
                      setDeliveryType(e.target.value)
                    }
                  />

                  Delivery
                </label>

                <label>
                  <input
                    type="radio"
                    name="deliveryType"
                    value="pickup"
                    checked={deliveryType === "pickup"}
                    onChange={(e) =>
                      setDeliveryType(e.target.value)
                    }
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
        <option
          key={address.id}
          value={String(address.id)}
        >
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
        <p>
          Paga al recibir tu pedido o al retirarlo.
        </p>
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
        <p>
          Selecciona una tarjeta registrada en tu perfil.
        </p>
      </div>
    </label>

  </div>

  {paymentType === "card" && (
    <div className="checkout-saved-cards">

      <h3>Selecciona una tarjeta</h3>

      {savedPaymentMethods.length === 0 ? (

        <p className="checkout-payment-warning">
          No tienes tarjetas registradas.
          Agrega una tarjeta.
        </p>

      ) : (

        <div className="checkout-card-list">

          {savedPaymentMethods.map((payment) => (

            <label
              key={payment.id}
              className={`checkout-saved-card ${
                selectedPaymentId === String(payment.id)
                  ? "selected"
                  : ""
              }`}
            >
              <input
                type="radio"
                name="selectedPayment"
                value={String(payment.id)}
                checked={
                  selectedPaymentId === String(payment.id)
                }
                onChange={(e) =>
                  setSelectedPaymentId(e.target.value)
                }
              />

              <div>
                <strong>
                  {payment.brand} •••• {payment.last4}
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
                      <span>
                        {item.selectedOption}
                      </span>
                    )}
                  </div>

                  <strong>
                    C${item.price * item.quantity}
                  </strong>
                </div>
              ))}

            </div>

            <div className="summary-total">
              <span>Subtotal</span>
              <strong>C${cartSubtotal}</strong>
            </div>

            <button
              type="submit"
              className="confirm-order-button"
              disabled={
    cart.length === 0 ||
    (paymentType === "card" && !selectedPayment)
  }
            >
              Confirmar pedido
            </button>

          </aside>

        </form>

      </section>

    </main>
  );
}

export default Checkout;