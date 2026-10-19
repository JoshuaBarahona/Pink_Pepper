import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCcVisa,
  faCcMastercard,
} from "@fortawesome/free-brands-svg-icons";
import { faCreditCard } from "@fortawesome/free-solid-svg-icons";
import "./PaymentCardPreview.css";

function PaymentCardPreview({
  brand,
  last4 = "",
  holder = "",
  expirationMonth = "",
  expirationYear = "",
  cvv = "",
  isFlipped = false,
  onFlip,
}) {
  const brandIcon =
    brand === "Visa"
      ? faCcVisa
      : brand === "Mastercard"
        ? faCcMastercard
        : faCreditCard;

  return (
    <div className="card-preview-scene">
      <button
        type="button"
        className={`card-preview-inner ${
          isFlipped ? "is-flipped" : ""
        }`}
        onClick={onFlip}
        aria-label="Girar tarjeta"
        aria-pressed={isFlipped}
      >
        <div className="card-preview-face card-preview-front">
          <div className="card-preview-top">
            <span className="card-preview-bank">PINK PEPPER</span>
            <FontAwesomeIcon icon={brandIcon} size="2x" />
          </div>

          <div className="card-preview-chip" />

          <div className="card-preview-number">
            •••• •••• •••• {last4 || "••••"}
          </div>

          <div className="card-preview-bottom">
            <div>
              <small>TITULAR</small>
              <strong>{holder || "NOMBRE DEL TITULAR"}</strong>
            </div>
            <div>
              <small>VENCE</small>
              <strong>
                {expirationMonth
                  ? String(expirationMonth).padStart(2, "0")
                  : "MM"}
                /
                {expirationYear
                  ? String(expirationYear).slice(-2)
                  : "AA"}
              </strong>
            </div>
          </div>
        </div>

        <div className="card-preview-face card-preview-back">
          <div className="card-preview-stripe" />

          <div className="card-preview-signature">
            <span>FIRMA AUTORIZADA</span>
            <div className="card-preview-cvv">
              {cvv || "•••"}
            </div>
          </div>

          <div className="card-preview-back-footer">
            <span>PINK PEPPER</span>
            <FontAwesomeIcon icon={brandIcon} size="2x" />
          </div>
        </div>
      </button>
    </div>
  );
}

export default PaymentCardPreview;