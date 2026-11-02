import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../services/productService";
import "./Menu.css";

const categories = ["Todos", "Hamburguesas", "Pollo", "Bebidas"];

function Menu() {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("categoria");
  const selectedCategory = categories.includes(categoryParam)
    ? categoryParam
    : "Todos";

  useEffect(() => {
    async function loadProducts() {
      const data = await getProducts();
      setProducts(data);
    }

    loadProducts();
  }, []);

  const filteredProducts =
    selectedCategory === "Todos"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <main className="menu-page">
      <section className="menu-header">
        <span>NUESTRO MENÚ</span>
        <h1>Algo rico para cada antojo</h1>
        <p>
          Descubre nuestros favoritos y encuentra tu próximo antojo.
        </p>
      </section>

      <section className="menu-filters">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={
              selectedCategory === category
                ? "filter-button active"
                : "filter-button"
            }
            onClick={() =>
              setSearchParams(
                category === "Todos" ? {} : { categoria: category }
              )
            }
          >
            {category}
          </button>
        ))}
      </section>

      <section className="menu-products">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            name={product.name}
            description={product.description}
            price={product.price}
            category={product.category}
            options={product.options}
          />
        ))}
      </section>
    </main>
  );
}

export default Menu;
