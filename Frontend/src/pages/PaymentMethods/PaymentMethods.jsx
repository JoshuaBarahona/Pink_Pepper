
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PaymentCardForm from "../../components/PaymentCardForm/PaymentCardForm";
import "../Profile/Profile.css";
import "./PaymentMethods.css";

function PaymentMethods() {
  const {
    user,
    loadingUser,
    addPaymentMethod,
    editPaymentMethod,
    removePaymentMethod,
    makeDefaultPaymentMethod,
  } = useAuth();

  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = user?.paymentMethods ?? [];

  async function handleSavePayment(paymentData) {
    try {
      setIsProcessing(true);
      setPaymentError("");

      if (editingPayment) {
        await editPaymentMethod(editingPayment.id, paymentData);
      } else {
        await addPaymentMethod(paymentData);
      }

      setShowPaymentForm(false);
      setEditingPayment(null);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
        error.message ||
        "No se pudieron guardar los datos de la tarjeta."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  function handleEditPayment(payment) {
    setPaymentError("");
    setEditingPayment(payment);
    setShowPaymentForm(true);
  }

  function handleCancelForm() {
    setShowPaymentForm(false);
    setEditingPayment(null);
    setPaymentError("");
  }

  async function handleSetDefaultPayment(paymentId) {
    try {
      setIsProcessing(true);
      setPaymentError("");

      await makeDefaultPaymentMethod(paymentId);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
        "No se pudo establecer la tarjeta principal."
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeletePayment(paymentId) {
    try {
      setIsProcessing(true);
      setPaymentError("");

      await removePaymentMethod(paymentId);
    } catch (error) {
      setPaymentError(
        error.response?.data?.message ||
        "No se pudo eliminar la tarjeta."
      );
    } finally {
      setIsProcessing(false);
    }
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

        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Mis tarjetas</h2>

            {!showPaymentForm && (
              <button
                type="button"
                className="profile-add-button"
                disabled={isProcessing}
                onClick={() => {
                  setPaymentError("");
                  setEditingPayment(null);
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
              initialPayment={editingPayment}
              onSave={handleSavePayment}
              onCancel={handleCancelForm}
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

                      <h3>•••• {payment.lastFour}</h3>
                      <p>{payment.holder}</p>
                    </div>

                    {payment.isDefault && (
                      <span className="default-address">
                        Principal
                      </span>
                    )}
                  </div>

                  <p className="payment-expiration">
                    Vence{" "}
                    {String(payment.expirationMonth).padStart(2, "0")}/
                    {payment.expirationYear}
                  </p>

                  <div className="payment-actions">
                    <button
                      type="button"
                      className="payment-default-button"
                      disabled={isProcessing}
                      onClick={() => handleEditPayment(payment)}
                    >
                      Editar
                    </button>

                    {!payment.isDefault && (
                      <button
                        type="button"
                        className="payment-default-button"
                        disabled={isProcessing}
                        onClick={() =>
                          handleSetDefaultPayment(payment.id)
                        }
                      >
                        Hacer principal
                      </button>
                    )}

                    <button
                      type="button"
                      className="payment-delete-button"
                      disabled={isProcessing}
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
