import { useCart } from "../../context/CartContext";
import "./Cart.css";

import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartSubtotal,
  } = useCart();

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
            <h2>Tu carrito está vacío</h2>
            <p>Agrega algo rico desde nuestro menú.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">

              {cart.map((item) => (
                <article className="cart-item" key={`${item.id}-${item.selectedOption || "default"}`}>

                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    {item.selectedOption &&(
                      <span className="cart-item-option">
                        {item.selectedOption}
                      </span>
                    )}

                    <span className="cart-item-price">
                      C${item.price}
                    </span>

                    <div className="cart-quantity">
                      <button
                        onClick={() => decreaseQuantity(item.id, item.selectedOption)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() => increaseQuantity(item.id, item.selectedOption)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-remove"
                      onClick={() => removeFromCart(item.id, item.selectedOption)}
                    >
                      Eliminar
                    </button>
                  </div>

                  <strong className="cart-item-total">
                    C${item.price * item.quantity}
                  </strong>

                </article>
              ))}

            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>C${cartSubtotal}</strong>
              </div>

              <button 
              className="checkout-button"
              onClick={() => navigate("/checkout")}
              >
                Continuar pedido
              </button>
            </div>
          </>
        )}

      </section>
    </main>
  );
}

export default Cart;