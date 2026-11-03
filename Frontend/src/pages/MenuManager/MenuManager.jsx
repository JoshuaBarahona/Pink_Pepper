import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFloppyDisk,
  faCircleCheck,
  faBan,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import {
  getProductsForManagement,
  createProduct,
  updateProduct,
  uploadProductImage,
} from "../../services/productService";

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
  image: null,
};

function MenuManager() {
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");
const [saving, setSaving] = useState(false);
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

  const [updatingIds, setUpdatingIds] = useState([]);

  const [imagePreview, setImagePreview] = useState("");

useEffect(() => {
  if (!formData.image) {
    setImagePreview("");
    return;
  }

  const previewUrl = URL.createObjectURL(formData.image);
  setImagePreview(previewUrl);

  return () => URL.revokeObjectURL(previewUrl);
}, [formData.image]);

  useEffect(() => {
  loadProducts();
}, []);

async function loadProducts() {
  try {
    setLoading(true);
    setErrorMessage("");

    const products = await getProductsForManagement();

    setItems(products);
  } catch (error) {
    console.error("Error al cargar productos:", error);

    setErrorMessage(
      error.response?.data?.message ||
      "No se pudieron cargar los productos."
    );
  } finally {
    setLoading(false);
  }
}

  const handleToggle = async (itemId) => {
  try {
    setUpdatingIds((prev) => [...prev, itemId]);

    const item = items.find((product) => product.id === itemId);

    if (!item) return;

    const updatedProduct = await updateProduct(itemId, {
      estado: !item.available,
    });

    setItems((prev) =>
      prev.map((product) =>
        product.id === itemId
          ? { ...product, available: updatedProduct.available }
          : product
      )
    );

    setNotice("Disponibilidad actualizada correctamente.");
  } catch (error) {
    setNotice(
  error.response?.data?.message ||
  "No se pudo actualizar la disponibilidad."
);
  } finally {
    setUpdatingIds((prev) => prev.filter((id) => id !== itemId));
  }
};

  function handlePriceChange(itemId, value) {
    setPriceDrafts((currentDrafts) => ({
      ...currentDrafts,
      [itemId]: value,
    }));

    setSavedId(null);
    setNotice(null);
  }

async function handleSavePrice(item) {
  const newPrice = Number(priceDrafts[item.id]);

if (
  !Number.isFinite(newPrice) ||
  newPrice <= 0 ||
  !/^\d+(\.\d{1,2})?$/.test(String(priceDrafts[item.id]))
) {
  return;
}

  try {
    setErrorMessage("");
    setNotice(null);

    const updatedProduct = await updateProduct(item.id, {
      precio: newPrice,
    });

    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? updatedProduct : currentItem
      )
    );

    setPriceDrafts((currentDrafts) => {
      const nextDrafts = { ...currentDrafts };
      delete nextDrafts[item.id];
      return nextDrafts;
    });

    setSavedId(item.id);
  } catch (error) {
    console.error("Error al actualizar precio:", error);

    setErrorMessage(
      error.response?.data?.message ||
      "No se pudo actualizar el precio."
    );
  }
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
    setNotice(null);
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

  function handleImageChange(e) {
  const file = e.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      image: "Selecciona una imagen JPG, PNG o WebP.",
    }));
    e.target.value = "";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      image: "La imagen no puede superar los 5 MB.",
    }));
    e.target.value = "";
    return;
  }

  setFormData((currentData) => ({
    ...currentData,
    image: file,
  }));

  setFormErrors((currentErrors) => ({
    ...currentErrors,
    image: undefined,
  }));
}

  async function handleAddProduct(e) {
  e.preventDefault();

  const name = formData.name.trim();
  const price = Number(formData.price);
  const description = formData.description.trim();
  const errors = {};

  if (!name) {
    errors.name = "Escribe el nombre del platillo.";
  } else if (name.length > 50) {
    errors.name = "El nombre no puede superar los 50 caracteres.";
  } else if (
    items.some(
      (item) => item.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    errors.name = "Ya existe un platillo con ese nombre.";
  }

  if (!formData.category) {
    errors.category = "Elige una categoría.";
  }

  if (!formData.price || !Number.isFinite(price) || price <= 0) {
    errors.price = "Escribe un precio mayor que cero.";
  }

  if (description.length > 50) {
    errors.description = "La descripción no puede superar los 50 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    return;
  }

  try {
    setSaving(true);
    setErrorMessage("");
    setNotice(null);

    let newItem = await createProduct({
  name,
  category: formData.category,
  price,
  description,
});

// Si se seleccionó una imagen, subirla después de crear el producto.
if (formData.image) {
  try {
    newItem = await uploadProductImage(newItem.id, formData.image);
  } catch (imageError) {
    console.error("Error al subir la imagen:", imageError);

    setItems((currentItems) => [...currentItems, newItem]);
    setSelectedCategory("Todos");

    handleCloseForm();

    setNotice(
      "El producto se creó, pero no se pudo subir su imagen. Puedes editarlo posteriormente para agregarla."
    );

    return;
  }
}

setItems((currentItems) => [...currentItems, newItem]);

    setSelectedCategory("Todos");
    setNotice(`Se agregó ${name} al menú.`);

    handleCloseForm();
  } catch (error) {
    console.error("Error al crear producto:", error);

    setErrorMessage(
      error.response?.data?.message ||
      "No se pudo agregar el producto."
    );
  } finally {
    setSaving(false);
  }
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
          {errorMessage && (
  <p className="menu-manager-error" role="alert">
    {errorMessage}
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
                    maxLength={50}
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
                    step="0.01"
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
    maxLength={50}
  />

  {formErrors.description && (
    <small className="menu-manager-field-error">
      {formErrors.description}
    </small>
  )}
</div>

<div className="menu-manager-field menu-manager-field-wide">
  <label htmlFor="new-product-image">
    Imagen del platillo
  </label>

  <input
    type="file"
    id="new-product-image"
    accept="image/jpeg,image/png,image/webp"
    onChange={handleImageChange}
  />

  {formErrors.image && (
    <small className="menu-manager-field-error">
      {formErrors.image}
    </small>
  )}

  {imagePreview && (
    <div className="menu-manager-image-preview">
      <img
        src={imagePreview}
        alt="Vista previa del platillo"
      />
    </div>
  )}

  <small>Formatos JPG, PNG o WebP. Máximo 5 MB.</small>
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

                <button
  type="submit"
  className="menu-manager-submit-button"
  disabled={saving}
>
  <FontAwesomeIcon icon={faPlus} />
  {saving ? "Guardando..." : "Agregar al menú"}
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
          {loading ? (
  <p>Cargando productos...</p>
) : filteredItems.length === 0 ? (
  <p>No hay productos en esta categoría.</p>
) : (
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
                          step="0.01"
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
                        disabled={!isDirty || !isValid || saving}
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
                    disabled={updatingIds.includes(item.id)}
                  >
                    <span className="menu-manager-toggle-knob" />
                  </button>

                </li>
              );
            })}
          </ul>
)}

        </div>

      </section>
    </main>
  );
}

export default MenuManager;
