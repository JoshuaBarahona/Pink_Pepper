import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faChartColumn,
  faUtensils,
} from "@fortawesome/free-solid-svg-icons";

import "./ManagerNav.css";

const managerLinks = [
  { to: "/gerente", label: "Panel", icon: faGauge, end: true },
  { to: "/gerente/reportes", label: "Reportes", icon: faChartColumn },
  { to: "/gerente/menu", label: "Menú", icon: faUtensils },
];

function ManagerNav() {
  return (
    <nav className="manager-nav" aria-label="Módulo del gerente">
      {managerLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `manager-nav-link ${isActive ? "active" : ""}`
          }
        >
          <FontAwesomeIcon icon={link.icon} />
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default ManagerNav;
