import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <AuthProvider>
    <CartProvider>
      <OrderProvider>
    <App />
    </OrderProvider>
    </CartProvider>
    </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
