import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faUtensils,
  faStar,
  faLocationDot,
  faClock,
  faPhone,
  faHamburger,
  faDrumstickBite,
  faGlassWater,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faFacebookF,
} from "@fortawesome/free-brands-svg-icons";
import { useAuth } from "../../context/AuthContext";

import heroImage from "../../assets/images/Inicio_Pink_final.png";
import ProductCard from "../../components/ProductCard/ProductCard";
import ChickenImage from "../../assets/images/chicken.jpg";
import Groovie from "../../assets/images/Groovie.jpg";
import Classic from "../../assets/images/Clasica.jpg";
import CategoryCard from "../../components/CategoryCard/CategoryCard";
import bebidasCategoryImage from "../../assets/images/Bebidas_Categoria.jpg";

import "./Home.css";

const favoriteProducts = [
  {
    image: Classic,
    name: "Hamburguesa clásica",
    description:
      "Hamburguesa de carne 100% de res, lechuga, tomate y cebolla.",
    price: "270",
  },

  {
    image: ChickenImage,
    name: "Chicken fingers",
    description: "Incluye papas fritas y 1 salsa.",
    price: "220",
  },

  {
    image: Groovie,
    name: "Groovie Burger",
    description:
      "Hamburguesa con carne 100% de res con queso cheddar, tocino, aros de cebolla, lechuga y salsa chipotle.",
    price: "360",
  },
];

const menuCategories = [
  {
    image: Classic,
    name: "Hamburguesas",
    icon: faHamburger,
  },
  {
    image: ChickenImage,
    name: "Pollo",
    icon: faDrumstickBite,
  },
  {
    image: bebidasCategoryImage,
    name: "Bebidas",
    icon: faGlassWater,
  },
];

function Home() {

  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">

        <div className="hero-image">
          <img
            src={heroImage}
            alt="Pink Pepper - Something for everyone"
          />
        </div>

        <div className="hero-content">

          <p className="hero-small-text">
            PINK PEPPER
          </p>

          <h1>
            Una propuesta
            <br />
            llena de sabor
          </h1>

          <p className="hero-description">
            Brunch, sabor y buena vibra al estilo
            americano de los 80's.
          </p>

          <button className="hero-button">
            Ver nuestro menú

            <FontAwesomeIcon icon={faArrowRight} />
          </button>

        </div>

      </section>


      {/* FAVORITOS */}
      <section className="favorites">

  <div className="section-title">

    <FontAwesomeIcon icon={faUtensils} />

    <h2>
      Nuestros favoritos
    </h2>

    <p>
      Los clásicos que tienes que probar.
    </p>

  </div>

  <div className="products-grid">

  {favoriteProducts.map((product) => (
    <ProductCard
      key={product.name}
      image={product.image}
      name={product.name}
      description={product.description}
      price={product.price}
    />
  ))}

</div>

<button className="menu-button">
  Ver menú completo
  <FontAwesomeIcon icon={faArrowRight} />
</button>

  </section>

      {/* CATEGORÍAS */}
    <section className="menu-categories" id="menu">

      <div className="categories-title">
        <span>EXPLORA NUESTRO MENÚ</span>

        <h2>Algo para cada antojo</h2>

        <p>
          Elige una categoría y descubre todo lo que tenemos para ti.
        </p>
      </div>

      <div className="categories-grid">
        {menuCategories.map((category) => (
          <CategoryCard
            key={category.name}
            image={category.image}
            name={category.name}
            icon={category.icon}
          />
        ))}
      </div>

    </section>

  <section className="location" id="nosotros">

  <div className="location-header">

    <span className="location-label">
      <FontAwesomeIcon icon={faLocationDot} />
      VISÍTANOS
    </span>

    <h2>Ven a conocernos</h2>

    <p>
      Un buen lugar, buena comida y la mejor vibra.
    </p>

  </div>

  <div className="location-content">

    {/* INFORMACIÓN */}
    <div className="location-info">

      <h3>Encuéntranos</h3>

      <div className="location-item">

        <div className="location-icon">
          <FontAwesomeIcon icon={faLocationDot} />
        </div>

        <div>
          <span>Dirección</span>
          <p>Colonia 10 de Junio, esquina noreste del colegio Otto de la Rocha, Managua, Nicaragua</p>
        </div>

      </div>

      <div className="location-item">

        <div className="location-icon">
          <FontAwesomeIcon icon={faClock} />
        </div>

        <div>
          <span>Horario</span>
          <p>Martes - Domingo<br />1:00 PM - 9:00 PM</p>
        </div>

      </div>

      <div className="location-item">

        <div className="location-icon">
          <FontAwesomeIcon icon={faPhone} />
        </div>

        <div>
          <span>Teléfono</span>
          <p>+505 7556-3416</p>
        </div>

      </div>

    </div>

    {/* MAPA */}
    <div className="location-map">
  <iframe
    src="https://www.google.com/maps?q=12.135274,-86.241970&z=17&output=embed"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="Ubicación de Pink Pepper"
  ></iframe>
</div>

  </div>

</section>

<footer className="footer">

  <div className="footer-main">

    {/* MARCA */}
    <div className="footer-brand">

      <h2>
        PINK <span>PEPPER</span>
      </h2>

      <p>
        Sabor, buena vibra y ese toque especial
        que hace cada visita inolvidable.
      </p>

      <div className="footer-social">

        <a href="#" aria-label="Instagram">
          <FontAwesomeIcon icon={faInstagram} />
        </a>

        <a href="#" aria-label="Facebook">
          <FontAwesomeIcon icon={faFacebookF} />
        </a>

      </div>

    </div>


    {/* NAVEGACIÓN */}
    <div className="footer-column">

      <h3>Explora</h3>

      <a href="#inicio">Inicio</a>
      <a href="#menu">Menú</a>
      <a href="#nosotros">Nosotros</a>

    </div>


    {/* INFORMACIÓN */}
    <div className="footer-column">

      <h3>Visítanos</h3>

      <p>Managua, Nicaragua</p>
      <p>Martes - Domingo</p>
      <p>1:00 PM - 9:00 PM</p>

    </div>

  </div>


  {/* COPYRIGHT */}
  <div className="footer-bottom">

    <p>
      © 2026 Pink Pepper. Todos los derechos reservados.
    </p>

    <span>
      Made with ♥
    </span>

  </div>

</footer>

    </main>
  );
}

export default Home;