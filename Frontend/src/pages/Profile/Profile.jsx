import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PaymentCardForm from "../../components/PaymentCardForm/PaymentCardForm";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { user, loadingUser, updateUser, logout} = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
const [editingAddressId, setEditingAddressId] = useState(null);
const [showPaymentForm, setShowPaymentForm] = useState(false);

function handleAddPayment() {
  setShowPaymentForm(true);
}

function handleCancelPayment() {
  setShowPaymentForm(false);
}

function handleSavePayment(newPayment) {
  const currentPayments = user.paymentMethods ?? [];

  updateUser({
    ...user,
    paymentMethods: [
      ...currentPayments,
      {
        ...newPayment,
        isDefault: currentPayments.length === 0,
      },
    ],
  });

  setShowPaymentForm(false);
}

const [addressForm, setAddressForm] = useState({
  label: "",
  address: "",
  reference: "",
});

  function handleEdit() {
  setFormData({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  });

  setIsEditing(true);
}

function handleChange(e) {
  const { name, value } = e.target;

  setFormData((currentData) => ({
    ...currentData,
    [name]: value,
  }));
}

function handleCancel() {
  setIsEditing(false);
}

function handleSave(e) {
  e.preventDefault();

  const updatedUser = {
    ...user,
    ...formData,
  };

  updateUser(updatedUser);

  setIsEditing(false);
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

function handleSaveAddress(e) {
  e.preventDefault();

  let updatedAddresses;

  if (editingAddressId !== null) {
    updatedAddresses = user.addresses.map((address) =>
      address.id === editingAddressId
        ? {
            ...address,
            ...addressForm,
          }
        : address
    );
  } else {
    const newAddress = {
      id: Date.now(),
      ...addressForm,
      isDefault: user.addresses.length === 0,
    };

    updatedAddresses = [
      ...user.addresses,
      newAddress,
    ];
  }

  updateUser({
    ...user,
    addresses: updatedAddresses,
  });

  handleCancelAddress();
}

function handleDeleteAddress(addressId) {
  const addressToDelete = user.addresses.find(
    (address) => address.id === addressId
  );

  let updatedAddresses = user.addresses.filter(
    (address) => address.id !== addressId
  );

  if (
    addressToDelete?.isDefault &&
    updatedAddresses.length > 0
  ) {
    updatedAddresses = updatedAddresses.map(
      (address, index) => ({
        ...address,
        isDefault: index === 0,
      })
    );
  }

  updateUser({
    ...user,
    addresses: updatedAddresses,
  });
}

function handleSetDefaultAddress(addressId) {
  const updatedAddresses = user.addresses.map(
    (address) => ({
      ...address,
      isDefault: address.id === addressId,
    })
  );

  updateUser({
    ...user,
    addresses: updatedAddresses,
  });
}

function handleSetDefaultPayment(paymentId) {
  const updatedPaymentMethods = user.paymentMethods.map(
    (payment) => ({
      ...payment,
      isDefault: payment.id === paymentId,
    })
  );

  updateUser({
    ...user,
    paymentMethods: updatedPaymentMethods,
  });
}

function handleDeletePayment(paymentId) {
  const paymentToDelete = user.paymentMethods.find(
    (payment) => payment.id === paymentId
  );

  let updatedPaymentMethods = user.paymentMethods.filter(
    (payment) => payment.id !== paymentId
  );

  if (
    paymentToDelete?.isDefault &&
    updatedPaymentMethods.length > 0
  ) {
    updatedPaymentMethods = updatedPaymentMethods.map(
      (payment, index) => ({
        ...payment,
        isDefault: index === 0,
      })
    );
  }

  updateUser({
    ...user,
    paymentMethods: updatedPaymentMethods,
  });
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

  function handleLogout() {
  logout();
  navigate("/login");
}

  return (
    <main className="profile-page">

      <div className="profile-container">

        <header className="profile-header">
          <span>MI CUENTA</span>
          <h1>Mi perfil</h1>
          <p>
            Administra tu información personal y tus
            direcciones de entrega.
          </p>
        </header>

        <button
  type="button"
  onClick={handleLogout}
>
  Cerrar sesión (prueba)
</button>

        <Link
  to="/checkout"
  style={{
    display: "inline-block",
    marginBottom: "20px",
    color: "#D94F70",
    fontWeight: "bold",
  }}
>
  Volver a Checkout (prueba)
</Link>

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
        <span>Nombre</span>
        <strong>
          {user.firstName} {user.lastName}
        </strong>
      </div>

      <div>
        <span>Correo electrónico</span>
        <strong>{user.email}</strong>
      </div>

      <div>
        <span>Teléfono</span>
        <strong>{user.phone}</strong>
      </div>

    </div>

  ) : (

    <form
      className="profile-edit-form"
      onSubmit={handleSave}
    >

      <div className="profile-form-grid">

        <div className="profile-field">
          <label htmlFor="firstName">
            Nombre
          </label>

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
          <label htmlFor="lastName">
            Apellidos
          </label>

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
          <label htmlFor="email">
            Correo electrónico
          </label>

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
          <label htmlFor="phone">
            Teléfono
          </label>

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

        <button
          type="submit"
          className="profile-save-button"
        >
          Guardar cambios
        </button>

      </div>

    </form>

  )}

</section>

        <section className="profile-section">

          <div className="profile-section-header">
            <h2>Mis direcciones</h2>

            {!showAddressForm &&(
            <button
              type="button"
              className="profile-add-button" onClick={handleAddAddress}
            >
              + Agregar dirección
            </button>
            )}
          </div>

          {showAddressForm && (

  <form
    className="address-form"
    onSubmit={handleSaveAddress}
  >

    <h3>
      {editingAddressId !== null
        ? "Editar dirección"
        : "Nueva dirección"}
    </h3>

    <div className="profile-form-grid">

      <div className="profile-field">
        <label htmlFor="addressLabel">
          Nombre de la dirección
        </label>

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
        <label htmlFor="address">
          Dirección
        </label>

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
        <label htmlFor="reference">
          Referencia
        </label>

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

      <button
        type="submit"
        className="profile-save-button"
      >
        {editingAddressId !== null
          ? "Guardar cambios"
          : "Agregar dirección"}
      </button>

    </div>

  </form>

)}

          <div className="addresses-list">

  {user.addresses.map((address) => (
    <article
      className="address-card"
      key={address.id}
    >

      <div className="address-header">

        <h3>{address.label}</h3>

        {address.isDefault && (
          <span className="default-address">
            Principal
          </span>
        )}

      </div>

      <p className="address-text">
        {address.address}
      </p>

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
            onClick={() =>
              handleSetDefaultAddress(address.id)
            }
          >
            Hacer principal
          </button>
        )}

        <button
          type="button"
          onClick={() =>
            handleEditAddress(address)
          }
        >
          Editar
        </button>

        <button
          type="button"
          className="delete-address"
          onClick={() =>
            handleDeleteAddress(address.id)
          }
        >
          Eliminar
        </button>

      </div>

    </article>
  ))}

</div>

        </section>

        <section className="profile-section">

          <div className="profile-section-header">

            <div>
  <h2>Métodos de pago</h2>

  <p className="payment-description">
    Administra las tarjetas asociadas a tu cuenta.
  </p>
</div>

{!showPaymentForm && (
  <button
    type="button"
    className="profile-add-button"
    onClick={handleAddPayment}
  >
    + Agregar tarjeta
  </button>
)}

</div>

{showPaymentForm && (
  <PaymentCardForm
    onSave={handleSavePayment}
    onCancel={handleCancelPayment}
  />
)}

          {user.paymentMethods.length === 0 ? (

            <div className="empty-payment-methods">
              <p>No tienes tarjetas registradas.</p>
            </div>

          ) : (

            <div className="payment-methods-list">

              {user.paymentMethods.map((payment) => (

                <article
                  className="payment-card"
                  key={payment.id}
                >

                  <div className="payment-card-header">

                    <div>
                      <span className="payment-brand">
                        {payment.brand}
                      </span>

                      <h3>
                        •••• {payment.last4}
                      </h3>
                    </div>

                    {payment.isDefault && (
                      <span className="default-address">
                        Principal
                      </span>
                    )}

                  </div>

                  <p className="payment-expiration">
                    Vence {payment.expirationMonth}/
                    {payment.expirationYear}
                  </p>

                  <div className="payment-actions">

  {!payment.isDefault && (
    <button
      type="button"
      className="payment-default-button"
      onClick={() =>
        handleSetDefaultPayment(payment.id)
      }
    >
      Hacer principal
    </button>
  )}

  <button
    type="button"
    className="payment-delete-button"
    onClick={() =>
      handleDeletePayment(payment.id)
    }
  >
    Eliminar
  </button>

</div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default Profile;