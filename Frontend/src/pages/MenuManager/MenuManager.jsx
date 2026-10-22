import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faCircleCheck,
  faBan,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import ManagerNav from "../../components/ManagerNav/ManagerNav";
import "./MenuManager.css";

/* ---------------------------------------------------------
   DATOS DE PRUEBA
   Mismas categorías que Menu.jsx. Reemplazar por
   productService cuando se conecte el backend.
--------------------------------------------------------- */

const categories = ["Todos", "Hamburguesas", "Pollo", "Bebidas"];

// Categorías que se pueden asignar a un platillo nuevo
const productCategories = categories.filter(
  (category) => category !== "Todos"
);

const emptyForm = {
  name: "",
  category: "",
  price: "",
  description: "",
};

const mockMenu = [
  { id: 1, name: "Hamburguesa clásica", category: "Hamburguesas", price: 270, available: true },
  { id: 2, name: "Groovie Burger", category: "Hamburguesas", price: 360, available: true },
  { id: 3, name: "Hamburguesa doble queso", category: "Hamburguesas", price: 330, available: true },
  { id: 4, name: "Chicken fingers", category: "Pollo", price: 220, available: true },
  { id: 5, name: "Alitas BBQ", category: "Pollo", price: 250, available: false },
  { id: 6, name: "Sándwich de pollo crispy", category: "Pollo", price: 240, available: true },
  { id: 7, name: "Limonada de fresa", category: "Bebidas", price: 75, available: true },
  { id: 8, name: "Té helado", category: "Bebidas", price: 65, available: true },
  { id: 9, name: "Malteada de chocolate", category: "Bebidas", price: 130, available: true },
];

function MenuManager() {
  const [items, setItems] = useState(mockMenu);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Precios que el gerente está escribiendo y aún no guarda: { [id]: "texto" }
  const [priceDrafts, setPriceDrafts] = useState({});
  const [savedId, setSavedId] = useState(null);

  // Formulario para agregar platillos
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [notice, setNotice] = useState(null);

  const filteredItems =
    selectedCategory === "Todos"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const unavailableCount = items.filter((item) => !item.available).length;

  function handleToggle(itemId) {
    // Cuando exista backend: guardar la disponibilidad aquí.
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, available: !item.available } : item
      )
    );

    setSavedId(null);
    setNotice(null);
  }

  function handlePriceChange(itemId, value) {
    setPriceDrafts((currentDrafts) => ({
      ...currentDrafts,
      [itemId]: value,
    }));

    setSavedId(null);
    setNotice(null);
  }

  function handleSavePrice(item) {
    const newPrice = Number(priceDrafts[item.id]);

    if (!Number.isFinite(newPrice) || newPrice <= 0) return;

    // Cuando exista backend: guardar el precio aquí.
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id
          ? { ...currentItem, price: newPrice }
          : currentItem
      )
    );

    setPriceDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[item.id];
      return nextDrafts;
    });

    setSavedId(item.id);
  }

  function handleOpenForm() {
    setFormData(emptyForm);
    setFormErrors({});
    setNotice(null);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setFormData(emptyForm);
    setFormErrors({});
  }

  function handleFormChange(e) {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    // Quita el error del campo que se está corrigiendo
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: undefined,
    }));
  }

  function handleAddProduct(e) {
    e.preventDefault();

    const name = formData.name.trim();
    const price = Number(formData.price);
    const errors = {};

    if (!name) {
      errors.name = "Escribe el nombre del platillo.";
    } else if (
      items.some((item) => item.name.toLowerCase() === name.toLowerCase())
    ) {
      errors.name = "Ya existe un platillo con ese nombre.";
    }

    if (!formData.category) {
      errors.category = "Elige una categoría.";
    }

    if (!formData.price || !Number.isFinite(price) || price <= 0) {
      errors.price = "Escribe un precio mayor que cero.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newItem = {
      id: Date.now(),
      name,
      category: formData.category,
      price,
      description: formData.description.trim(),
      available: true,
    };

    // Cuando exista backend: crear el producto aquí.
    setItems((currentItems) => [...currentItems, newItem]);

    // Muestra todo el menú para que el gerente vea el platillo nuevo
    setSelectedCategory("Todos");
    setNotice(`Se agregó ${name} al menú.`);

    handleCloseForm();
  }

  return (
    <main className="menu-manager-page">
      <section className="menu-manager-container">

        {/* ENCABEZADO */}
        <div className="menu-manager-header">
          <span>GESTIÓN DEL MENÚ</span>
          <h1>Disponibilidad y precios</h1>
          <p>
            Desactiva los platillos que se agotaron y ajusta sus precios.
          </p>
        </div>

        <ManagerNav />


        <div className="menu-manager-section">

          {/* CABECERA DE LA LISTA */}
          <div className="menu-manager-section-header">
            <h2>Platillos</h2>

            <div className="menu-manager-section-actions">
              <span
                className={`menu-manager-count ${
                  unavailableCount > 0 ? "alert" : ""
                }`}
              >
                {unavailableCount === 0
                  ? "Todo disponible"
                  : `${unavailableCount} ${
                      unavailableCount === 1 ? "agotado" : "agotados"
                    }`}
              </span>

              {!showForm && (
                <button
                  type="button"
                  className="menu-manager-add-button"
                  onClick={handleOpenForm}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  Agregar platillo
                </button>
              )}
            </div>
          </div>

          {/* AVISO */}
          {notice && (
            <p className="menu-manager-notice" role="status">
              <FontAwesomeIcon icon={faCircleCheck} />
              {notice}
            </p>
          )}

          {/* FORMULARIO: NUEVO PLATILLO */}
          {showForm && (
            <form
              className="menu-manager-form"
              onSubmit={handleAddProduct}
              noValidate
            >
              <h3>Nuevo platillo</h3>

              <div className="menu-manager-form-grid">

                <div className="menu-manager-field">
                  <label htmlFor="new-product-name">Nombre</label>

                  <input
                    type="text"
                    id="new-product-name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ej. Hamburguesa BBQ"
                    aria-invalid={!!formErrors.name}
                    autoFocus
                  />

                  {formErrors.name && (
                    <small className="menu-manager-field-error">
                      {formErrors.name}
                    </small>
                  )}
                </div>

                <div className="menu-manager-field">
                  <label htmlFor="new-product-category">Categoría</label>

                  <select
                    id="new-product-category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    aria-invalid={!!formErrors.category}
                  >
                    <option value="">Selecciona una categoría</option>

                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {formErrors.category && (
                    <small className="menu-manager-field-error">
                      {formErrors.category}
                    </small>
                  )}
                </div>

                <div className="menu-manager-field">
                  <label htmlFor="new-product-price">Precio (C$)</label>

                  <input
                    type="number"
                    id="new-product-price"
                    name="price"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="Ej. 280"
                    aria-invalid={!!formErrors.price}
                  />

                  {formErrors.price && (
                    <small className="menu-manager-field-error">
                      {formErrors.price}
                    </small>
                  )}
                </div>

                <div className="menu-manager-field menu-manager-field-wide">
                  <label htmlFor="new-product-description">
                    Descripción (opcional)
                  </label>

                  <textarea
                    id="new-product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Ej. Carne de res, queso cheddar y salsa BBQ."
                  />
                </div>

              </div>

              <div className="menu-manager-form-actions">
                <button
                  type="button"
                  className="menu-manager-cancel-button"
                  onClick={handleCloseForm}
                >
                  Cancelar
                </button>

                <button type="submit" className="menu-manager-submit-button">
                  <FontAwesomeIcon icon={faPlus} />
                  Agregar al menú
                </button>
              </div>
            </form>
          )}

          {/* FILTROS */}
          <div
            className="menu-manager-filters"
            role="group"
            aria-label="Filtrar por categoría"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`menu-manager-filter ${
                  selectedCategory === category ? "active" : ""
                }`}
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* LISTA */}
          <ul className="menu-manager-list">
            {filteredItems.map((item) => {
              const draft = priceDrafts[item.id];
              const inputValue = draft ?? String(item.price);
              const isValid = Number(inputValue) > 0;
              const isDirty = draft !== undefined && Number(draft) !== item.price;

              return (
                <li
                  className={`menu-manager-item ${
                    item.available ? "" : "unavailable"
                  }`}
                  key={item.id}
                >

                  {/* INFO */}
                  <div className="menu-manager-item-info">
                    <strong>{item.name}</strong>

                    <div className="menu-manager-item-tags">
                      <span className="menu-manager-category">
                        {item.category}
                      </span>

                      <span
                        className={`menu-manager-status ${
                          item.available ? "on" : "off"
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={item.available ? faCircleCheck : faBan}
                        />
                        {item.available ? "Disponible" : "Agotado"}
                      </span>
                    </div>
                  </div>

                  {/* PRECIO */}
                  <div className="menu-manager-price">
                    <label htmlFor={`price-${item.id}`}>Precio</label>

                    <div className="menu-manager-price-row">
                      <div
                        className={`menu-manager-price-input ${
                          isValid ? "" : "invalid"
                        }`}
                      >
                        <span>C$</span>

                        <input
                          id={`price-${item.id}`}
                          type="number"
                          min="1"
                          step="1"
                          inputMode="numeric"
                          value={inputValue}
                          onChange={(e) =>
                            handlePriceChange(item.id, e.target.value)
                          }
                        />
                      </div>

                      <button
                        type="button"
                        className="menu-manager-save-button"
                        disabled={!isDirty || !isValid}
                        onClick={() => handleSavePrice(item)}
                      >
                        <FontAwesomeIcon icon={faFloppyDisk} />
                        Guardar
                      </button>
                    </div>

                    {savedId === item.id && (
                      <small className="menu-manager-saved" role="status">
                        <FontAwesomeIcon icon={faCircleCheck} />
                        Precio actualizado
                      </small>
                    )}
                  </div>

                  {/* INTERRUPTOR */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.available}
                    aria-label={`Disponibilidad de ${item.name}`}
                    className={`menu-manager-toggle ${
                      item.available ? "on" : ""
                    }`}
                    onClick={() => handleToggle(item.id)}
                  >
                    <span className="menu-manager-toggle-knob" />
                  </button>

                </li>
              );
            })}
          </ul>

        </div>

      </section>
    </main>
  );
}

export default MenuManager;
