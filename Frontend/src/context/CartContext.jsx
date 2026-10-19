import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(product) {
  setCart((currentCart) => {
    const existingProduct = currentCart.find(
      (item) =>
        item.id === product.id &&
        item.selectedOption === product.selectedOption
    );

    if (existingProduct) {
      return currentCart.map((item) =>
        item.id === product.id &&
        item.selectedOption === product.selectedOption
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

    return [
      ...currentCart,
      {
        ...product,
        quantity: 1,
      },
    ];
  });
}

  function increaseQuantity(id, selectedOption) {
  setCart((currentCart) =>
    currentCart.map((item) =>
      item.id === id &&
      item.selectedOption === selectedOption
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
}

function decreaseQuantity(id, selectedOption) {
  setCart((currentCart) =>
    currentCart
      .map((item) =>
        item.id === id &&
        item.selectedOption === selectedOption
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0)
  );
}

function removeFromCart(id, selectedOption) {
  setCart((currentCart) =>
    currentCart.filter(
      (item) =>
        !(
          item.id === id &&
          item.selectedOption === selectedOption
        )
    )
  );
}

function clearCart() {
  setCart([]);
}

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartSubtotal = cart.reduce(
  (total, item) => total + item.price * item.quantity,
  0
);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        cartCount,
        cartSubtotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}