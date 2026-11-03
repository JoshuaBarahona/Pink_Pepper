import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowTrendUp,
  faArrowTrendDown,
  faTrophy,
  faMotorcycle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

import { getDashboardMetrics } from "../../services/dashboardService";
import ManagerNav from "../../components/ManagerNav/ManagerNav";
import "./LocalReports.css";

/* ---------------------------------------------------------
   DATOS DE PRUEBA
   Reemplazar por el servicio de reportes cuando exista.
--------------------------------------------------------- */

const weeklySales = [
  { day: "Lun", amount: 5120 },
  { day: "Mar", amount: 5480 },
  { day: "Mié", amount: 5310 },
  { day: "Jue", amount: 6340 },
  { day: "Vie", amount: 9870 },
  { day: "Sáb", amount: 11250 },
  { day: "Dom", amount: 8640 },
];

const previousWeekTotal = 46800;
const weeklyOrders = 148;

const productSales = [
  { id: 1, name: "Hamburguesa clásica", price: 270, units: 48 },
  { id: 2, name: "Chicken fingers", price: 220, units: 40 },
  { id: 3, name: "Groovie Burger", price: 360, units: 36 },
  { id: 4, name: "Alitas BBQ", price: 250, units: 22 },
];

const driverStats = [
  { id: 1, name: "Roberto Salgado", deliveries: 42, avgMinutes: 24 },
  { id: 2, name: "Daniela Pérez", deliveries: 38, avgMinutes: 27 },
  { id: 3, name: "Javier Obando", deliveries: 31, avgMinutes: 31 },
  { id: 4, name: "Karla Mejía", deliveries: 29, avgMinutes: 26 },
];

/* ---------------------------------------------------------
   UTILIDADES
--------------------------------------------------------- */

function formatMoney(amount) {
  return `C$${amount.toLocaleString("es-NI")}`;
}

function formatShort(amount) {
  return `${(amount / 1000).toFixed(1)}k`;
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");
}

function LocalReports() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchMetrics() {
      try {
        const data = await getDashboardMetrics();
        if (!ignore && data) {
          setMetrics(data);
        }
      } catch (err) {
        console.error("Error cargando métricas del dashboard:", err);
      }
    }
    fetchMetrics();
    return () => {
      ignore = true;
    };
  }, []);

  /* VENTAS */
  const activeWeeklySales =
    metrics?.ganancias_ultima_semana?.desglose_diario?.map((d) => ({
      day: d.dia,
      amount: d.ganancias,
    })) || weeklySales;

  const weeklyTotal =
    metrics?.ganancias_ultima_semana?.ganancias_totales ??
    activeWeeklySales.reduce((sum, day) => sum + day.amount, 0);

  const maxDaySales = Math.max(...activeWeeklySales.map((day) => day.amount), 1);

  const averageTicket =
    metrics?.ganancias_ultima_semana?.ticket_promedio ??
    Math.round(weeklyTotal / (metrics?.pedidos_hechos?.pedidos_creados_semana || weeklyOrders));

  const changePercent =
    metrics?.ganancias_ultima_semana?.variacion_porcentual !== null &&
    metrics?.ganancias_ultima_semana?.variacion_porcentual !== undefined
      ? Math.round(metrics.ganancias_ultima_semana.variacion_porcentual)
      : Math.round(
          ((weeklyTotal - previousWeekTotal) / previousWeekTotal) * 100
        );

  const isUp = changePercent >= 0;

  /* TOP 3 PRODUCTOS */
  const topProducts = [...productSales]
    .sort((a, b) => b.units - a.units)
    .slice(0, 3);
  const maxUnits = topProducts[0].units;

  /* REPARTIDORES */
  const activeDriverStats =
    metrics?.tiempo_promedio_repartidores?.repartidores?.map((r) => ({
      id: r.id_repartidor,
      name: r.nombre_completo,
      deliveries: r.pedidos_entregados_semana,
      avgMinutes: r.tiempo_promedio_minutos || 0,
    })) || driverStats;

  const maxDeliveries = Math.max(
    ...activeDriverStats.map((driver) => driver.deliveries),
    1
  );

  return (
    <main className="reports-page">
      <section className="reports-container">

        {/* ENCABEZADO */}
        <div className="reports-header">
          <span>REPORTES DEL LOCAL</span>
          <h1>Cómo va la semana</h1>
          <p>
            Ventas, productos más pedidos y desempeño de tus repartidores.
          </p>
        </div>

        <ManagerNav />


        <div className="reports-grid">

          {/* VENTAS DE LA SEMANA */}
          <article className="reports-card reports-sales">

            <div className="reports-card-header">
              <h2>Ventas totales de la semana</h2>

              <span className={`reports-trend ${isUp ? "up" : "down"}`}>
                <FontAwesomeIcon
                  icon={isUp ? faArrowTrendUp : faArrowTrendDown}
                />
                {isUp ? "+" : ""}
                {changePercent}% vs semana anterior
              </span>
            </div>

            <div className="reports-sales-figures">
              <strong className="reports-big-number">
                {formatMoney(weeklyTotal)}
              </strong>

              <div className="reports-sales-stats">
                <div>
                  <span>Pedidos</span>
                  <strong>
                    {metrics?.pedidos_hechos?.pedidos_creados_semana ?? weeklyOrders}
                  </strong>
                </div>

                <div>
                  <span>Ticket promedio</span>
                  <strong>{formatMoney(averageTicket)}</strong>
                </div>
              </div>
            </div>

            <div
              className="reports-chart"
              role="img"
              aria-label={`Ventas por día: ${activeWeeklySales
                .map((day) => `${day.day} ${formatMoney(day.amount)}`)
                .join(", ")}`}
            >
              {activeWeeklySales.map((day) => (
                <div className="reports-chart-column" key={day.day}>
                  <span className="reports-chart-value">
                    {formatShort(day.amount)}
                  </span>

                  <div className="reports-chart-track">
                    <div
                      className={`reports-chart-bar ${
                        day.amount === maxDaySales ? "best" : ""
                      }`}
                      style={{
                        height: `${(day.amount / maxDaySales) * 100}%`,
                      }}
                    />
                  </div>

                  <span className="reports-chart-day">{day.day}</span>
                </div>
              ))}
            </div>

          </article>


          {/* TOP 3 PRODUCTOS */}
          <article className="reports-card">

            <div className="reports-card-header">
              <h2>Productos más vendidos</h2>
              <FontAwesomeIcon icon={faTrophy} className="reports-card-icon" />
            </div>

            <ol className="reports-ranking">
              {topProducts.map((product, index) => (
                <li className="reports-ranking-item" key={product.id}>

                  <span className="reports-rank">{index + 1}</span>

                  <div className="reports-ranking-info">
                    <div className="reports-ranking-top">
                      <strong>{product.name}</strong>
                      <span>{product.units} vendidos</span>
                    </div>

                    <div className="reports-bar-track">
                      <div
                        className="reports-bar-fill"
                        style={{
                          width: `${(product.units / maxUnits) * 100}%`,
                        }}
                      />
                    </div>

                    <small>
                      {formatMoney(product.units * product.price)} en ventas
                    </small>
                  </div>

                </li>
              ))}
            </ol>

          </article>


          {/* REPARTIDORES */}
          <article className="reports-card">

            <div className="reports-card-header">
              <h2>Rendimiento de repartidores</h2>
              <FontAwesomeIcon
                icon={faMotorcycle}
                className="reports-card-icon"
              />
            </div>

            <ul className="reports-drivers">
              {activeDriverStats.map((driver) => (
                <li className="reports-driver" key={driver.id}>

                  <div className="reports-driver-avatar">
                    {getInitials(driver.name)}
                  </div>

                  <div className="reports-ranking-info">
                    <div className="reports-ranking-top">
                      <strong>{driver.name}</strong>

                      <span className="reports-time-badge">
                        <FontAwesomeIcon icon={faClock} />
                        {driver.avgMinutes} min
                      </span>
                    </div>

                    <div className="reports-bar-track">
                      <div
                        className="reports-bar-fill"
                        style={{
                          width: `${
                            (driver.deliveries / maxDeliveries) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <small>{driver.deliveries} entregas</small>
                  </div>

                </li>
              ))}
            </ul>

            <p className="reports-footnote">
              Tiempo promedio por entrega durante la semana.
            </p>

          </article>

        </div>

      </section>
    </main>
  );
}

export default LocalReports;
