import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faMinus,
  faPlus,
  faTrashCan,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
  useCart,
  DELIVERY_FEE,
  MAX_ITEM_QUANTITY,
} from "../../context/CartContext";
import "./Cart.css";

function formatMoney(value) {
  return `C$${Number(value).toFixed(2)}`;
}

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartSubtotal,
  } = useCart();

  function handleClearCart() {
    if (window.confirm("¿Seguro que deseas vaciar tu carrito?")) {
      clearCart();
    }
  }

  return (
    <main className="cart-page">
      <section className="cart-container">
        <div className="cart-header">
          <span>TU PEDIDO</span>
          <h1>Carrito de compras</h1>
          <p>Revisa tu pedido antes de continuar.</p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <FontAwesomeIcon icon={faCartShopping} className="empty-cart-icon" />
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algo rico desde nuestro menú.</p>
            <Link to="/menu" className="empty-cart-button">
              Ver menú
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <div className="cart-items-toolbar">
                <span>
                  {cartCount} {cartCount === 1 ? "producto" : "productos"}
                </span>

                <button
                  type="button"
                  className="cart-clear"
                  onClick={handleClearCart}
                >
                  Vaciar carrito
                </button>
              </div>

              {cart.map((item) => (
                <article
                  className="cart-item"
                  key={`${item.id}-${item.selectedOption || "default"}`}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  )}

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>

                    {item.selectedOption && (
                      <span className="cart-item-option">
                        {item.selectedOption}
                      </span>
                    )}

                    <span className="cart-item-price">
                      {formatMoney(item.price)} c/u
                    </span>

                    <div className="cart-quantity">
                      <button
                        type="button"
                        aria-label={`Quitar una unidad de ${item.name}`}
                        onClick={() =>
                          decreaseQuantity(item.id, item.selectedOption)
                        }
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>

                      <span aria-live="polite">{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${item.name}`}
                        disabled={item.quantity >= MAX_ITEM_QUANTITY}
                        onClick={() =>
                          increaseQuantity(item.id, item.selectedOption)
                        }
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    {item.quantity >= MAX_ITEM_QUANTITY && (
                      <small className="cart-item-limit">
                        Máximo {MAX_ITEM_QUANTITY} unidades por producto
                      </small>
                    )}
                  </div>

                  <div className="cart-item-side">
                    <strong className="cart-item-total">
                      {formatMoney(item.price * item.quantity)}
                    </strong>

                    <button
                      type="button"
                      className="cart-remove"
                      aria-label={`Eliminar ${item.name} del carrito`}
                      onClick={() =>
                        removeFromCart(item.id, item.selectedOption)
                      }
                    >
                      <FontAwesomeIcon icon={faTrashCan} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </article>
              ))}

              <Link to="/menu" className="cart-continue">
                <FontAwesomeIcon icon={faArrowLeft} /> Seguir comprando
              </Link>
            </div>

            <aside className="cart-summary">
              <h2>Resumen</h2>

              <div className="cart-summary-row">
                <span>Subtotal</span>
                <strong>{formatMoney(cartSubtotal)}</strong>
              </div>

              <div className="cart-summary-row cart-summary-muted">
                <span>Envío a domicilio</span>
                <span>{formatMoney(DELIVERY_FEE)}</span>
              </div>

              <p className="cart-summary-note">
                El envío solo se cobra si eliges delivery. Retiro en local es
                gratis.
              </p>

              <div className="cart-summary-row cart-summary-total">
                <span>Total estimado</span>
                <strong>{formatMoney(cartSubtotal + DELIVERY_FEE)}</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Continuar pedido
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}

export default Cart;
