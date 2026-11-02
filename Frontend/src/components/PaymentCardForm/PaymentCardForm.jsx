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

function PaymentCardForm({ onSave, onCancel }) {
  const [paymentForm, setPaymentForm] = useState({
    ...initialPaymentForm,
  });

  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const {
    holder,
    number,
    expirationMonth,
    expirationYear,
    cvv,
  } = paymentForm;

  const brand = detectCardBrand(number);

  const isValid =
    validHolder(holder) &&
    validateCardNumber(number) &&
    validateExpiration(expirationMonth, expirationYear) &&
    /^\d{3}$/.test(cvv);

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

    const newPayment = {
      id: crypto.randomUUID(),
      type: "card",
      brand,
      last4: number.replace(/\D/g, "").slice(-4),
      holder: holder.trim().toUpperCase(),
      expirationMonth: String(expirationMonth).padStart(2, "0"),
      expirationYear: String(expirationYear).slice(-2),
      isMock: true,
    };

    onSave(newPayment);

    setPaymentForm({ ...initialPaymentForm });
    setIsCardFlipped(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT") {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="payment-card-form" onKeyDown={handleKeyDown}>
      <h3>Agregar tarjeta de prueba</h3>

      <p className="payment-form-note">
        Demostración con datos ficticios.
        No introduzcas tarjetas reales.
      </p>

      <div className="payment-preview-container">
        <PaymentCardPreview
          brand={brand}
          last4={number.replace(/\D/g, "").slice(-4)}
          holder={holder}
          expirationMonth={expirationMonth}
          expirationYear={expirationYear}
          cvv={cvv}
          isFlipped={isCardFlipped}
          onFlip={() =>
            setIsCardFlipped((current) => !current)
          }
        />
      </div>

      <div className="payment-card-form-grid">
        <div className="payment-card-field">
          <label htmlFor="paymentHolder">
            Nombre del titular
          </label>

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

        <div className="payment-card-field">
          <label htmlFor="expirationMonth">
            Mes de vencimiento
          </label>

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
          <label htmlFor="expirationYear">
            Año de vencimiento
          </label>

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

        <div className="payment-card-field">
          <label htmlFor="paymentCvv">
            CVV de prueba
          </label>

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
          Guardar tarjeta
        </button>
      </div>
    </div>
  );
}

export default PaymentCardForm;
