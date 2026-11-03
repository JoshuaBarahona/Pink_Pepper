import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Profile.css";

function Profile() {
 const {
  user,
  loadingUser,
  updateProfile,
  addAddress,
  editAddress,
  removeAddress,
  makeDefaultAddress,
} = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [addressError, setAddressError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    email: "",
    phone: "",
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    label: "",
    address: "",
    reference: "",
  });

  const addresses = user?.addresses ?? [];

  function handleEdit() {
    setFormData({
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      secondLastName: user.secondLastName || "",
      email: user.email || "",
      phone: user.phone || "",
    });

    setProfileError("");
    setIsEditing(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setProfileError("");
  }

  function handleCancel() {
    setProfileError("");
    setIsEditing(false);
  }

  function normalizeName(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  async function handleSave(e) {
    e.preventDefault();
    setProfileError("");

    const firstName = normalizeName(formData.firstName);
    const middleName = normalizeName(formData.middleName);
    const lastName = normalizeName(formData.lastName);
    const secondLastName = normalizeName(formData.secondLastName);
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();

    if (!firstName || !lastName) {
      setProfileError(
        "El primer nombre y el primer apellido son obligatorios."
      );
      return;
    }

    if (!email) {
      setProfileError("Debes ingresar un correo electrónico.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setProfileError(
        "Ingresa un correo electrónico con un formato válido."
      );
      return;
    }

    if (!phone) {
      setProfileError("Debes ingresar un número de teléfono.");
      return;
    }

    try {
  await updateProfile({
    firstName,
    middleName,
    lastName,
    secondLastName,
    email,
    phone,
  });

  setIsEditing(false);
} catch (error) {
  setProfileError(
    error.response?.data?.message ||
      error.message ||
      "No se pudieron guardar los cambios."
  );
}
}

  function handleAddressChange(e) {
    const { name, value } = e.target;

    setAddressForm((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleAddAddress() {
    setEditingAddressId(null);

    setAddressForm({
      label: "",
      address: "",
      reference: "",
    });

    setShowAddressForm(true);
  }

  function handleEditAddress(address) {
    setEditingAddressId(address.id);

    setAddressForm({
      label: address.label,
      address: address.address,
      reference: address.reference || "",
    });

    setShowAddressForm(true);
  }

  function handleCancelAddress() {
    setShowAddressForm(false);
    setEditingAddressId(null);

    setAddressForm({
      label: "",
      address: "",
      reference: "",
    });
  }

  async function handleSaveAddress(e) {
  e.preventDefault();
  setAddressError("");

  try {
    if (editingAddressId !== null) {
      await editAddress(editingAddressId, addressForm);
    } else {
      await addAddress(addressForm);
    }

    handleCancelAddress();
  } catch (error) {
    setAddressError(
      error.response?.data?.message ||
        error.message ||
        "No se pudo guardar la dirección."
    );
  }
}

  async function handleDeleteAddress(addressId) {
  setAddressError("");

  try {
    await removeAddress(addressId);
  } catch (error) {
    setAddressError(
      error.response?.data?.message ||
        error.message ||
        "No se pudo eliminar la dirección."
    );
  }
}

  async function handleSetDefaultAddress(addressId) {
  setAddressError("");

  try {
    await makeDefaultAddress(addressId);
  } catch (error) {
    setAddressError(
      error.response?.data?.message ||
        error.message ||
        "No se pudo establecer la dirección principal."
    );
  }
}

  if (loadingUser) {
    return (
      <main className="profile-page">
        <p>Cargando perfil...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="profile-page">
        <p>Debes iniciar sesión para ver tu perfil.</p>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <span>MI CUENTA</span>
          <h1>Mi perfil</h1>
          <p>
            Administra tu información personal y tus direcciones de entrega.
          </p>
        </header>

        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Información personal</h2>

            {!isEditing && (
              <button
                type="button"
                className="profile-secondary-button"
                onClick={handleEdit}
              >
                Editar
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="personal-info">
              <div>
                <span>Nombre completo</span>
                <strong>
                  {[
                    user.firstName,
                    user.middleName,
                    user.lastName,
                    user.secondLastName,
                  ]
                    .filter((name) => name?.trim())
                    .join(" ")}
                </strong>
              </div>

              <div>
                <span>Correo electrónico</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>Teléfono</span>
                <strong>{user.phone?.trim() || "Sin registrar"}</strong>
              </div>
            </div>
          ) : (
            <form className="profile-edit-form" onSubmit={handleSave}>
              {profileError && (
                <p className="profile-error" role="alert">
                  {profileError}
                </p>
              )}

              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="firstName">Primer nombre</label>
                  <input
                    id="firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="middleName">Segundo nombre (opcional)</label>
                  <input
                    id="middleName"
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="lastName">Primer apellido</label>
                  <input
                    id="lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="secondLastName">
                    Segundo apellido (opcional)
                  </label>
                  <input
                    id="secondLastName"
                    type="text"
                    name="secondLastName"
                    value={formData.secondLastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="email">Correo electrónico</label>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="phone">Teléfono</label>

                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>

                <button type="submit" className="profile-save-button">
                  Guardar cambios
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="profile-section">
          <div className="profile-section-header">
            <h2>Mis direcciones</h2>

            {!showAddressForm && (
              <button
                type="button"
                className="profile-add-button"
                onClick={handleAddAddress}
              >
                + Agregar dirección
              </button>
            )}
          </div>

          {showAddressForm && (
            <form className="address-form" onSubmit={handleSaveAddress}>
              <h3>
                {editingAddressId !== null
                  ? "Editar dirección"
                  : "Nueva dirección"}
              </h3>

              <div className="profile-form-grid">
                <div className="profile-field">
                  <label htmlFor="addressLabel">Nombre de la dirección</label>

                  <input
                    id="addressLabel"
                    type="text"
                    name="label"
                    value={addressForm.label}
                    onChange={handleAddressChange}
                    placeholder="Ej. Casa, Trabajo..."
                    required
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="address">Dirección</label>

                  <input
                    id="address"
                    type="text"
                    name="address"
                    value={addressForm.address}
                    onChange={handleAddressChange}
                    placeholder="Escribe la dirección"
                    required
                  />
                </div>

                <div className="profile-field address-reference-field">
                  <label htmlFor="reference">Referencia</label>

                  <input
                    id="reference"
                    type="text"
                    name="reference"
                    value={addressForm.reference}
                    onChange={handleAddressChange}
                    placeholder="Ej. Casa azul, portón negro..."
                  />
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="button"
                  className="profile-cancel-button"
                  onClick={handleCancelAddress}
                >
                  Cancelar
                </button>

                <button type="submit" className="profile-save-button">
                  {editingAddressId !== null
                    ? "Guardar cambios"
                    : "Agregar dirección"}
                </button>
              </div>
            </form>
          )}

          {addressError && (
  <p className="profile-error" role="alert">
    {addressError}
  </p>
)}

          <div className="addresses-list">
            {addresses.map((address) => (
              <article className="address-card" key={address.id}>
                <div className="address-header">
                  <h3>{address.label}</h3>

                  {address.isDefault && (
                    <span className="default-address">Principal</span>
                  )}
                </div>

                <p className="address-text">{address.address}</p>

                {address.reference && (
                  <p className="address-reference">
                    Referencia: {address.reference}
                  </p>
                )}

                <div className="address-actions">
                  {!address.isDefault && (
                    <button
                      type="button"
                      className="default-button"
                      onClick={() => handleSetDefaultAddress(address.id)}
                    >
                      Hacer principal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEditAddress(address)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Profile;
