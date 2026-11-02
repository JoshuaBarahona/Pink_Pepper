import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./CategoryCard.css";

function CategoryCard({ image, name, icon, onClick }) {
  function handleKeyDown(e) {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <article
      className="category-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="category-image">
        <img src={image} alt={name} />

        <div className="category-overlay">
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>

      <div className="category-info">
        <h3>{name}</h3>

        <span className="category-link">
          Ver categoría
          <span>→</span>
        </span>
      </div>
    </article>
  );
}

export default CategoryCard;
