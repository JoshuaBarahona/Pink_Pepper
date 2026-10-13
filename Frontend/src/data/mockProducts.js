import ChickenImage from "../assets/images/chicken.jpg";
import Groovie from "../assets/images/Groovie.jpg";
import Classic from "../assets/images/Clasica.jpg";

export const mockProducts = [
  // =========================
  // POLLO
  // =========================

  {
    id: 1,
    name: "Alitas (6 piezas)",
    description: "Incluye papas fritas y 1 salsa. Elige entre Búfalo, BBQ o Mango Habanero.",
    price: 240,
    category: "Pollo",
    image: ChickenImage,
    available: true,
    options: {
      label: "Elige tu salsa",
      required: true,
      values: ["Búfalo", "BBQ", "Mango habanero"],
    },
  },
  {
    id: 2,
    name: "Chicken Fingers",
    description: "Incluye papas fritas y 1 salsa. Elige entre Búfalo, BBQ o Mango Habanero.",
    price: 220,
    category: "Pollo",
    image: ChickenImage,
    available: true,
    options: {
      label: "Elige tu salsa",
      required: true,
      values: ["Búfalo", "BBQ", "Mango habanero"],
    },
  },

  // =========================
  // HAMBURGUESAS
  // =========================

  {
    id: 3,
    name: "Hamburguesa Clásica",
    description: "Hamburguesa con carne 100% res, lechuga, tomate y cebolla.",
    price: 270,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },
  {
    id: 4,
    name: "La Smoke Burger",
    description: "Hamburguesa con carne 100% res con salsa BBQ casera, tocino, cebolla caramelizada y lechuga.",
    price: 290,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },
  {
    id: 5,
    name: "Cheese Burger Wow",
    description: "Hamburguesa con carne 100% res, queso cheddar, tocino y cebolla caramelizada.",
    price: 290,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },
  {
    id: 6,
    name: "Chicken Burger",
    description: "Hamburguesa de pollo frito, queso mozzarella, lechuga, salsa pepper y tocino.",
    price: 280,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },
  {
    id: 7,
    name: "Billie Jeans Burger",
    description: "Hamburguesa con carne 100% res con salsa chimichurri casera, queso Filadelfia y lechuga.",
    price: 320,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },
  {
    id: 8,
    name: "Groovie Burger",
    description: "Hamburguesa con carne 100% res con queso cheddar, tocino, aros de cebolla, lechuga y salsa chipotle.",
    price: 360,
    category: "Hamburguesas",
    image: Groovie,
    available: true,
  },
  {
    id: 9,
    name: "Queens Burger",
    description: "Hamburguesa de res, salsa pepper, lechuga, tocino, queso cheddar, tomate, cebolla caramelizada y 2 alitas encima.",
    price: 420,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },
  {
    id: 10,
    name: "Monterrey Burger",
    description: "Hamburguesa de pollo, queso mozzarella, cebolla, tocino, salsa ranch, tomate y lechuga.",
    price: 290,
    category: "Hamburguesas",
    image: Classic,
    available: true,
  },

  // =========================
  // BEBIDAS
  // =========================

  {
    id: 11,
    name: "Smoothie de Frutas",
    description: "Consultar disponibilidad de sabores.",
    price: 80,
    category: "Bebidas",
    image: Classic,
    available: true,
  },
  {
    id: 12,
    name: "Coca-Cola",
    description: "Coca-Cola.",
    price: 55,
    category: "Bebidas",
    image: Classic,
    available: true,
  },
  {
    id: 13,
    name: "Té Frío",
    description: "Té frío.",
    price: 60,
    category: "Bebidas",
    image: Classic,
    available: true,
  },
  {
    id: 14,
    name: "Malteada",
    description: "Disponible en fresa, chocolate o vainilla.",
    price: 90,
    category: "Bebidas",
    image: Classic,
    available: true,
    options: {
      label: "Elige el sabor",
      required: true,
      values: ["Fresa", "Chocolate", "Vainilla"],
    },
  },
  {
    id: 15,
    name: "Limonada",
    description: "Limonada.",
    price: 70,
    category: "Bebidas",
    image: Classic,
    available: true,
  },
  {
    id: 16,
    name: "Agua Botella",
    description: "Agua embotellada.",
    price: 35,
    category: "Bebidas",
    image: Classic,
    available: true,
  },
];