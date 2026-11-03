import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { isCustomer } from "../utils/roles";

const CartContext = createContext();

const CART_STORAGE_PREFIX = "pinkpepper_cart_";

// Límite de unidades por producto para evitar pedidos accidentales
export const MAX_ITEM_QUANTITY = 20;

// Costo de envío para pedidos a domicilio (C$)
export const DELIVERY_FEE = 50;

// Un mismo producto con distinta opción se trata como una línea diferente
function isSameLine(item, id, selectedOption) {
  return (
    item.id === id && (item.selectedOption || "") === (selectedOption || "")
  );
}

function getStorageKey(user) {
  return isCustomer(user) ? `${CART_STORAGE_PREFIX}${user.id}` : null;
}

function readCart(storageKey) {
  if (!storageKey) return [];

  try {
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            item &&
            item.id !== undefined &&
            Number.isFinite(Number(item.price)) &&
            Number(item.quantity) > 0
        )
      : [];
  } catch (error) {
    console.error("No se pudo leer el carrito guardado:", error);
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const storageKey = getStorageKey(user);
  const canUseCart = storageKey !== null;

  // Cada cliente tiene su propio carrito guardado en el navegador
  const [cartState, setCartState] = useState(() => ({
    key: storageKey,
    items: readCart(storageKey),
  }));

  // Si cambia el usuario (login/logout), se carga su carrito correspondiente
  let cart = cartState.items;
  if (cartState.key !== storageKey) {
    cart = readCart(storageKey);
    setCartState({ key: storageKey, items: cart });
  }

  // Persistir los cambios del carrito del cliente actual
  useEffect(() => {
    if (!cartState.key) return;

    try {
      localStorage.setItem(cartState.key, JSON.stringify(cartState.items));
    } catch (error) {
      console.error("No se pudo guardar el carrito:", error);
    }
  }, [cartState]);

  function updateItems(updater) {
    if (!canUseCart) return;

    setCartState((current) => ({
      ...current,
      items: updater(current.items),
    }));
  }

  // Devuelve true si el producto se agregó, false si no está permitido
  function addToCart(product, quantity = 1) {
    if (!canUseCart) return false;

    const amount = Math.max(1, Math.floor(Number(quantity) || 1));

    updateItems((currentCart) => {
      const existing = currentCart.find((item) =>
        isSameLine(item, product.id, product.selectedOption)
      );

      if (existing) {
        return currentCart.map((item) =>
          isSameLine(item, product.id, product.selectedOption)
            ? {
                ...item,
                quantity: Math.min(item.quantity + amount, MAX_ITEM_QUANTITY),
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          description: product.description || "",
          image: product.image || "",
          category: product.category || "",
          price: Number(product.price),
          selectedOption: product.selectedOption || "",
          quantity: Math.min(amount, MAX_ITEM_QUANTITY),
        },
      ];
    });

    return true;
  }

  function increaseQuantity(id, selectedOption) {
    updateItems((currentCart) =>
      currentCart.map((item) =>
        isSameLine(item, id, selectedOption)
          ? {
              ...item,
              quantity: Math.min(item.quantity + 1, MAX_ITEM_QUANTITY),
            }
          : item
      )
    );
  }

  function decreaseQuantity(id, selectedOption) {
    updateItems((currentCart) =>
      currentCart
        .map((item) =>
          isSameLine(item, id, selectedOption)
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id, selectedOption) {
    updateItems((currentCart) =>
      currentCart.filter((item) => !isSameLine(item, id, selectedOption))
    );
  }

  function clearCart() {
    updateItems(() => []);
  }

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = Number(
    cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        canUseCart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
