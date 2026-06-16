import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Home from './pages/home/Home';
import AuthPage from './pages/auth/AuthPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Cart from './pages/cart/Cart';
import Checkout from './pages/checkout/Checkout';
import OrdersPage from './pages/orders/OrdersPage';
import ProductDetail from './pages/product/ProductDetail';
import { AuthProvider } from './components/AuthProvider';

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Toaster />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}
