import api from "./api";
import { mockProducts } from "../data/mockProducts";

const categoryNames = {
  HAMBURGUESAS: "Hamburguesas",
  POLLO: "Pollo",
  BEBIDAS: "Bebidas",
};

const categoryEnums = {
  Hamburguesas: "HAMBURGUESAS",
  Pollo: "POLLO",
  Bebidas: "BEBIDAS",
};

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

// Convierte las rutas del backend en URL completas.
function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("/uploads/")) {
    return new URL(imageUrl, api.defaults.baseURL).toString();
  }

  return imageUrl;
}

// Convierte un producto del backend al formato utilizado por React.
function mapProduct(product) {
  const originalProduct = mockProducts.find(
    (mock) => normalizeText(mock.name) === normalizeText(product.nombre)
  );

  const category =
    categoryNames[product.categoria?.toUpperCase()] ||
    product.categoria;

  return {
    id: product.id_producto,
    name: product.nombre,
    description: product.descripcion || "",
    image:
      getImageUrl(product.imagen_url) ||
      originalProduct?.image ||
      "",
    price: Number(product.precio),
    category,
    options: originalProduct?.options || null,
    available: product.estado,
  };
}

// Menú público: solamente productos activos.
export async function getProducts() {
  const response = await api.get("/products");
  return response.data.map(mapProduct);
}

// Menú administrativo: productos activos e inactivos.
export async function getProductsForManagement() {
  const response = await api.get("/products/all");
  return response.data.map(mapProduct);
}

// Crear un producto.
export async function createProduct(productData) {
  const response = await api.post("/products", {
    nombre: productData.name,
    descripcion: productData.description || "",
    precio: Number(productData.price),
    categoria: categoryEnums[productData.category],
    estado: true,
  });

  return mapProduct(response.data);
}

// Subir o reemplazar la imagen de un producto.
export async function uploadProductImage(productId, imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post(
    `/products/${productId}/image`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return mapProduct(response.data);
}

// Actualizar precio o disponibilidad.
export async function updateProduct(productId, productData) {
  const response = await api.patch(`/products/${productId}`, productData);
  return mapProduct(response.data);
}