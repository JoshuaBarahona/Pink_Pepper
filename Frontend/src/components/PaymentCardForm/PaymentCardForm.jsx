
import { useState } from "react";
import PaymentCardPreview from "../PaymentCardPreview/PaymentCardPreview";
import {
  detectCardBrand,
  validateCardNumber,
  formatCardNumber,
  validateExpiration,
} from "../../utils/cardValidation/cardValidation";
import "./PaymentCardForm.css";

const initialPaymentForm = {
  holder: "",
  number: "",
  expirationMonth: "",
  expirationYear: "",
  cvv: "",
};

const validHolder = (holder) =>
  /^[\p{L}\s.'-]{3,50}$/u.test(holder.trim());

function PaymentCardForm({ onSave, onCancel, initialPayment = null }) {
  const [paymentForm, setPaymentForm] = useState(() => ({
    ...initialPaymentForm,
    holder: initialPayment?.holder || "",
    expirationMonth: initialPayment?.expirationMonth
      ? String(initialPayment.expirationMonth)
      : "",
    expirationYear: initialPayment?.expirationYear
      ? String(initialPayment.expirationYear)
      : "",
  }));

  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const {
    holder,
    number,
    expirationMonth,
    expirationYear,
    cvv,
  } = paymentForm;

  const isEditing = Boolean(initialPayment);
  const brand = isEditing
    ? initialPayment.brand
    : detectCardBrand(number);

  const isValid =
    validHolder(holder) &&
    validateExpiration(expirationMonth, expirationYear) &&
    (isEditing ||
      (validateCardNumber(number) && /^\d{3}$/.test(cvv)));

  function handleChange(e) {
    const { name, value } = e.target;

    setPaymentForm((current) => ({
      ...current,
      [name]:
        name === "number"
          ? formatCardNumber(value)
          : name === "cvv"
            ? value.replace(/\D/g, "").slice(0, 3)
            : value,
    }));
  }

  function handleSubmit() {
    if (!isValid) return;

    const paymentData = isEditing
      ? {
          holder: holder.trim().toUpperCase(),
          brand: initialPayment.brand,
          lastFour: initialPayment.lastFour,
          expirationMonth: Number(expirationMonth),
          expirationYear: Number(expirationYear),
        }
      : {
          holder: holder.trim().toUpperCase(),
          brand,
          lastFour: number.replace(/\D/g, "").slice(-4),
          expirationMonth: Number(expirationMonth),
          expirationYear: Number(expirationYear),
        };

    onSave(paymentData);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="payment-card-form" onKeyDown={handleKeyDown}>
      <h3>{isEditing ? "Editar tarjeta" : "Agregar tarjeta de prueba"}</h3>

      {!isEditing && (
        <p className="payment-form-note">
          Demostración con datos ficticios.
          No introduzcas tarjetas reales.
        </p>
      )}

      <div className="payment-preview-container">
        <PaymentCardPreview
          brand={brand}
          last4={
            isEditing
              ? initialPayment.lastFour
              : number.replace(/\D/g, "").slice(-4)
          }
          holder={holder}
          expirationMonth={expirationMonth}
          expirationYear={expirationYear}
          cvv={cvv}
          isFlipped={isCardFlipped}
          onFlip={() => setIsCardFlipped((current) => !current)}
        />
      </div>

      <div className="payment-card-form-grid">
        <div className="payment-card-field">
          <label htmlFor="paymentHolder">Nombre del titular</label>
          <input
            id="paymentHolder"
            name="holder"
            type="text"
            maxLength={50}
            value={holder}
            onChange={handleChange}
            placeholder="Nombre del titular"
            autoComplete="off"
          />
        </div>

        {isEditing ? (
          <div className="payment-card-field">
            <label>Tarjeta registrada</label>
            <p>
              {initialPayment.brand} •••• {initialPayment.lastFour}
            </p>
            <small>
              Por seguridad, no se puede modificar el número de tarjeta.
            </small>
          </div>
        ) : (
          <>
            <div className="payment-card-field">
              <label htmlFor="paymentNumber">
                Número de tarjeta de prueba
              </label>
              <input
                id="paymentNumber"
                name="number"
                type="text"
                inputMode="numeric"
                maxLength={19}
                value={number}
                onChange={handleChange}
                placeholder="0000 0000 0000 0000"
                autoComplete="off"
              />
              <small className="payment-brand-indicator">
                {brand || "Sin identificar"}
              </small>

              {number.replace(/\D/g, "").length >= 13 && (
                <small
                  className={
                    validateCardNumber(number)
                      ? "payment-valid"
                      : "payment-invalid"
                  }
                >
                  {validateCardNumber(number)
                    ? "Número de prueba con formato válido"
                    : "Número inválido"}
                </small>
              )}
            </div>
          </>
        )}

        <div className="payment-card-field">
          <label htmlFor="expirationMonth">Mes de vencimiento</label>
          <input
            id="expirationMonth"
            name="expirationMonth"
            type="number"
            min="1"
            max="12"
            value={expirationMonth}
            onChange={handleChange}
            placeholder="MM"
            autoComplete="off"
          />
        </div>

        <div className="payment-card-field">
          <label htmlFor="expirationYear">Año de vencimiento</label>
          <input
            id="expirationYear"
            name="expirationYear"
            type="number"
            min={new Date().getFullYear()}
            max="2100"
            value={expirationYear}
            onChange={handleChange}
            placeholder="AAAA"
            autoComplete="off"
          />
        </div>

        {!isEditing && (
          <div className="payment-card-field">
            <label htmlFor="paymentCvv">CVV de prueba</label>
            <input
              id="paymentCvv"
              name="cvv"
              type="text"
              inputMode="numeric"
              maxLength={3}
              value={cvv}
              onChange={handleChange}
              onFocus={() => setIsCardFlipped(true)}
              onBlur={() => setIsCardFlipped(false)}
              placeholder="123"
              autoComplete="off"
            />
          </div>
        )}
      </div>

      <div className="payment-card-form-actions">
        <button
          type="button"
          className="payment-card-cancel"
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="payment-card-save"
          disabled={!isValid}
          onClick={handleSubmit}
        >
          {isEditing ? "Guardar cambios" : "Guardar tarjeta"}
        </button>
      </div>
    </div>
  );
}

export default PaymentCardForm;
