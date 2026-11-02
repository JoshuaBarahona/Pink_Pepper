
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PaymentCardForm from "../../components/PaymentCardForm/PaymentCardForm";
import "./PaymentMethods.css";

function PaymentMethods() {
  const { user, loadingUser, updateUser } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const paymentMethods = user?.paymentMethods ?? [];

  function handleSavePayment(newPayment) {
    try {
      updateUser({
        ...user,
        paymentMethods: [
          ...paymentMethods,
          {
            ...newPayment,
            isDefault: paymentMethods.length === 0,
          },
        ],
      });

      setShowPaymentForm(false);
      setPaymentError("");
    } catch (error) {
      setPaymentError(error.message || "No se pudo guardar la tarjeta.");
    }
  }

  function handleSetDefaultPayment(paymentId) {
    updateUser({
      ...user,
      paymentMethods: paymentMethods.map((payment) => ({
        ...payment,
        isDefault: payment.id === paymentId,
      })),
    });
  }

  function handleDeletePayment(paymentId) {
    const paymentToDelete = paymentMethods.find(
      (payment) => payment.id === paymentId
    );

    let updatedPayments = paymentMethods.filter(
      (payment) => payment.id !== paymentId
    );

    if (paymentToDelete?.isDefault && updatedPayments.length > 0) {
      updatedPayments = updatedPayments.map((payment, index) => ({
        ...payment,
        isDefault: index === 0,
      }));
    }

    updateUser({
      ...user,
      paymentMethods: updatedPayments,
    });
  }

  if (loadingUser) {
    return (
      <main className="profile-page">
        <p>Cargando métodos de pago...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <h1>Inicia sesión para continuar</h1>
          <p>Debes iniciar sesión para administrar tus tarjetas.</p>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <span>MI CUENTA</span>
          <h1>Métodos de pago</h1>
          <p>Administra las tarjetas asociadas a tu cuenta.</p>
        </header>
        
{/*<div className="payment-page-back">
          <Link to="/perfil">← Volver a mi perfil</Link>
        </div> */}
        

        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Mis tarjetas</h2>

            {!showPaymentForm && (
              <button
                type="button"
                className="profile-add-button"
                onClick={() => {
                  setPaymentError("");
                  setShowPaymentForm(true);
                }}
              >
                + Agregar tarjeta
              </button>
            )}
          </div>

          {paymentError && (
            <p className="profile-error" role="alert">
              {paymentError}
            </p>
          )}

          {showPaymentForm && (
            <PaymentCardForm
              onSave={handleSavePayment}
              onCancel={() => setShowPaymentForm(false)}
            />
          )}

          {paymentMethods.length === 0 ? (
            <div className="empty-payment-methods">
              <p>No tienes tarjetas registradas.</p>
            </div>
          ) : (
            <div className="payment-methods-list">
              {paymentMethods.map((payment) => (
                <article className="payment-card" key={payment.id}>
                  <div className="payment-card-header">
                    <div>
                      <span className="payment-brand">
                        {payment.brand}
                      </span>
                      <h3>•••• {payment.last4}</h3>
                    </div>

                    {payment.isDefault && (
                      <span className="default-address">
                        Principal
                      </span>
                    )}
                  </div>

                  <p className="payment-expiration">
                    Vence {payment.expirationMonth}/{payment.expirationYear}
                  </p>

                  <div className="payment-actions">
                    {!payment.isDefault && (
                      <button
                        type="button"
                        className="payment-default-button"
                        onClick={() => handleSetDefaultPayment(payment.id)}
                      >
                        Hacer principal
                      </button>
                    )}

                    <button
                      type="button"
                      className="payment-delete-button"
                      onClick={() => handleDeletePayment(payment.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default PaymentMethods;
