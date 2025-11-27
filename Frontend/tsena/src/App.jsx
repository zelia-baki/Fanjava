import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import Login from '@/pages/auth/Login';
import RegisterClient from '@/pages/auth/RegisterClient';
import RegisterEntreprise from '@/pages/auth/RegisterEntreprise';
import ProductList from '@/pages/products/ProductList';
import ProductDetail from '@/pages/products/ProductDetail';
import Cart from '@/pages/cart/Cart';
import Checkout from '@/pages/cart/Checkout';
import OrderConfirmation from '@/pages/cart/OrderConfirmation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<RegisterClient />} />
            <Route path="/register/entreprise" element={<RegisterEntreprise />} />
            
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            
            <Route
              path="/checkout"
              element={
                <ProtectedRoute userType="client">
                  <Checkout />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/order-confirmation/:orderId"
              element={
                <ProtectedRoute userType="client">
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;