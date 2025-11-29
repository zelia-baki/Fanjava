// src/App.jsx - VERSION CORRIGÉE

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
import ProductListEntreprise from '@/pages/entreprise/ProductListEntreprise';
import ProductCreate from '@/pages/entreprise/ProductCreate';
import ProductEdit from '@/pages/entreprise/ProductEdit';
import ClientDashboard from '@/pages/client/ClientDashboard';
import MyOrders from '@/pages/client/MyOrders';
import EntrepriseDashboard from '@/pages/entreprise/EntrepriseDashboard';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import EntrepriseOrders from '@/pages/entreprise/EntrepriseOrders';
import OrderDetail from '@/pages/entreprise/OrderDetail';
import MyReviews from '@/pages/client/MyReviews';
import EntrepriseReviews from '@/pages/entreprise/EntrepriseReviews';
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

            {/* Routes panier et client */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/dashboard/client" element={<ClientDashboard />} />
            <Route path="/profile/orders" element={<MyOrders />} />

            {/* Routes Entreprise */}
            <Route path="/dashboard/entreprise" element={<EntrepriseDashboard />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />

            <Route path="/entreprise/orders" element={<EntrepriseOrders />} />
            <Route path="/entreprise/orders/:id" element={<OrderDetail />} />
            // Routes Client
<Route path="/myreviews" element={<MyReviews />} />

// Routes Entreprise
<Route path="/entreprise/reviews" element={<EntrepriseReviews />} />

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

            {/* ✅ CORRIGÉ : Utiliser :slug au lieu de :id */}
            <Route
              path="/entreprise/products/:slug/edit"
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