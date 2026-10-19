import { useOrders } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import "./DriverDashboard.css";

function DriverDashboard() {
  const { orders, assignOrder, completeOrder } = useOrders();
  const { user } = useAuth();

  // Filtramos los pedidos que están pendientes o que son de este repartidor
  const pendingOrders = orders.filter((order) => order.status === "pendiente");
  const myOrders = orders.filter(
    (order) => order.status === "en_camino" && order.driverId === user.id
  );
  const completedOrders = orders.filter(
    (order) => order.status === "entregado" && order.driverId === user.id
  );

  return (
    <main className="driver-page">
      <div className="driver-container">
        <header className="driver-header">
          <span>PANEL DE REPARTIDOR</span>
          <h1>Mis Entregas</h1>
          <p>Hola {user.firstName}, aquí puedes gestionar tus pedidos asignados.</p>
        </header>

        {/* PEDIDOS PENDIENTES DE ASIGNAR */}
        <section className="driver-section">
          <h2>Pedidos Pendientes (Disponibles)</h2>
          {pendingOrders.length === 0 ? (
            <p className="empty-message">No hay pedidos nuevos por ahora.</p>
          ) : (
            <div className="orders-grid">
              {pendingOrders.map((order) => (
                <article className="driver-card" key={order.id}>
                  <div className="card-header">
                    <h3>{order.id}</h3>
                    <span className="status-badge pending">Pendiente</span>
                  </div>
                  <p><strong>Cliente:</strong> {order.customerName}</p>
                  <p><strong>Dirección:</strong> {order.address}</p>
                  <p><strong>Total:</strong> C${order.total}</p>
                  <button
                    className="driver-btn primary"
                    onClick={() => assignOrder(order.id, user.id)}
                  >
                    Aceptar Pedido
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* PEDIDOS EN CAMINO */}
        <section className="driver-section">
          <h2>Pedidos En Camino</h2>
          {myOrders.length === 0 ? (
            <p className="empty-message">No tienes pedidos en camino.</p>
          ) : (
            <div className="orders-grid">
              {myOrders.map((order) => (
                <article className="driver-card active-delivery" key={order.id}>
                  <div className="card-header">
                    <h3>{order.id}</h3>
                    <span className="status-badge on-way">En Camino</span>
                  </div>
                  <p><strong>Cliente:</strong> {order.customerName}</p>
                  <p><strong>Dirección:</strong> {order.address}</p>
                  <p><strong>Total:</strong> C${order.total}</p>
                  <button
                    className="driver-btn success"
                    onClick={() => completeOrder(order.id)}
                  >
                    Marcar como Entregado
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
        
        {/* HISTORIAL */}
        {completedOrders.length > 0 && (
          <section className="driver-section">
            <h2>Historial de Entregas</h2>
            <div className="orders-grid">
              {completedOrders.map((order) => (
                <article className="driver-card completed" key={order.id}>
                  <div className="card-header">
                    <h3>{order.id}</h3>
                    <span className="status-badge completed">Entregado</span>
                  </div>
                  <p><strong>Cliente:</strong> {order.customerName}</p>
                  <p><strong>Total:</strong> C${order.total}</p>
                </article>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

export default DriverDashboard;