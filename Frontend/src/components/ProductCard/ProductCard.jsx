import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  faCheck,
  faPlus,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

import "./ProductCard.css";

function ProductCard({
  id,
  image,
  name,
  description,
  price,
  category,
  options,
}) {
  const { addToCart, canUseCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  // Solo los clientes y los visitantes ven el botón de agregar
  const showAddButton = canUseCart || !isAuthenticated;

  useEffect(() => {
    if (!justAdded) return;

    const timer = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  function addProduct(option) {
    const added = addToCart({
      id,
      name,
      description,
      price: Number(price),
      image,
      category,
      selectedOption: option,
    });

    if (added) setJustAdded(true);
  }

  function handleAddToCart() {
    // Los visitantes deben iniciar sesión como clientes para comprar
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/menu" } });
      return;
    }

    if (options) {
      setShowOptions(true);
      return;
    }

    addProduct();
  }

  return (
    <article className="product-card">
      {/* IMAGEN */}
      <div className="product-image">
        <img src={image} alt={name} />

        <span className="product-favorite">
          <FontAwesomeIcon icon={faStar} />
        </span>
      </div>

      {/* INFORMACIÓN */}
      <div className="product-info">
        <h3>{name}</h3>

        <p>{description}</p>

        <div className="product-bottom">
          <span className="product-price">C${price}</span>

          {showAddButton && (
            <button
              type="button"
              className={`product-add ${justAdded ? "product-add-done" : ""}`}
              aria-label={
                justAdded
                  ? `${name} agregado al carrito`
                  : `Agregar ${name} al carrito`
              }
              onClick={handleAddToCart}
            >
              <FontAwesomeIcon icon={justAdded ? faCheck : faPlus} />
            </button>
          )}
        </div>

        {justAdded && (
          <p className="product-added-message" role="status">
            Agregado al carrito
          </p>
        )}

        {showOptions && options && (
          <div className="product-options">
            <p className="options-title">{options.label}</p>

            <div className="options-list">
              {options.values.map((option) => (
                <label key={option} className="option-item">
                  <input
                    type="radio"
                    name={`option-${id}`}
                    value={option}
                    checked={selectedOption === option}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />

                  {option}
                </label>
              ))}
            </div>

            <button
              type="button"
              className="confirm-option"
              disabled={!selectedOption}
              onClick={() => {
                addProduct(selectedOption);
                setShowOptions(false);
                setSelectedOption("");
              }}
            >
              Agregar al carrito
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default ProductCard;
