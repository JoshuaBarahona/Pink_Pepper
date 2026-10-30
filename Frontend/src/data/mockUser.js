export const mockUser = {
  id: 1,

  firstName: "Joshua",
  lastName: "Barahona",

  email: "joshua@email.com",
  phone: " ",

  addresses: [
    {
      id: 1,
      label: "Casa",
      address: "Dirección de ejemplo en Managua",
      reference: "Portón negro",
      isDefault: true,
    },

    {
      id: 2,
      label: "Trabajo",
      address: "Segunda dirección de ejemplo en Managua",
      reference: "",
      isDefault: false,
    },
  ],

  paymentMethods: [
    {
      id: 1,
      type: "card",
      brand: "Visa",
      last4: "4582",
      expirationMonth: "08",
      expirationYear: "29",
      isDefault: true,
    },

    {
      id: 2,
      type: "card",
      brand: "Mastercard",
      last4: "7291",
      expirationMonth: "11",
      expirationYear: "28",
      isDefault: false,
    },
  ],
};
