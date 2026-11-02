import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCart } from "../../context/CartContext";
import {
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
  const { addToCart } = useCart();
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  function handleAddToCart() {
    if (options) {
      setShowOptions(true);
      return;
    }

    addToCart({
      id,
      name,
      description,
      price: Number(price),
      image,
      category,
    });
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

          <button
            type="button"
            className="product-add"
            aria-label={`Agregar ${name} al carrito`}
            onClick={handleAddToCart}
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

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
                addToCart({
                  id,
                  name,
                  description,
                  price: Number(price),
                  image,
                  category,
                  selectedOption,
                });

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
