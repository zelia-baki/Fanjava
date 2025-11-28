// src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Auth
import Login from '@/pages/auth/Login';
import RegisterClient from '@/pages/auth/RegisterClient';
import RegisterEntreprise from '@/pages/auth/RegisterEntreprise';

// Public - Products
import ProductList from '@/pages/products/ProductList';
import ProductDetail from '@/pages/products/ProductDetail';

// Cart & Checkout
import Cart from '@/pages/cart/Cart';
import Checkout from '@/pages/cart/Checkout';
import OrderConfirmation from '@/pages/cart/OrderConfirmation';

// Entreprise
import Dashboard from '@/pages/entreprise/Dashboard';
import ProductListEntreprise from '@/pages/entreprise/ProductListEntreprise';
import ProductCreate from '@/pages/entreprise/ProductCreate';
import ProductEdit from '@/pages/entreprise/ProductEdit';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<RegisterClient />} />
            <Route path="/register/entreprise" element={<RegisterEntreprise />} />
            
            {/* Routes produits publiques */}
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            
            {/* Routes panier */}
            <Route path="/cart" element={<Cart />} />
            
            {/* Routes client protégées */}
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

            {/* Routes entreprise protégées */}
            <Route
              path="/entreprise/dashboard"
              element={
                <ProtectedRoute userType="entreprise">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/entreprise/products"
              element={
                <ProtectedRoute userType="entreprise">
                  <ProductListEntreprise />
                </ProtectedRoute>
              }
            />

            <Route
              path="/entreprise/products/create"
              element={
                <ProtectedRoute userType="entreprise">
                  <ProductCreate />
                </ProtectedRoute>
              }
            />

            <Route
              path="/entreprise/products/edit/:slug"
              element={
                <ProtectedRoute userType="entreprise">
                  <ProductEdit />
                </ProtectedRoute>
              }
            />

            {/* Route 404 */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-gray-600">Page non trouvée</p>
                  </div>
                </div>
              }
            />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
