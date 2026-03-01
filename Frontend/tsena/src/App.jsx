// src/App.jsx - VERSION AVEC ROUTES ADMIN

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages informatives
import Contact from '@/pages/static/Contact';
import Terms from '@/pages/static/Terms';
import Privacy from '@/pages/static/Privacy';
import ShippingReturns from '@/pages/static/ShippingReturns';
import FAQ from '@/pages/static/FAQ';

// Auth
import Login from '@/pages/auth/Login';
import RegisterClient from '@/pages/auth/RegisterClient';
import RegisterEntreprise from '@/pages/auth/RegisterEntreprise';

// Public - Products
import ProductList from '@/pages/products/ProductList';
import ProductDetail from '@/pages/products/ProductDetail';
import ProfileEdit from '@/pages/client/ProfileEdit';

// Cart & Checkout
import Cart from '@/pages/cart/Cart';
import Checkout from '@/pages/cart/Checkout';
import OrderConfirmation from '@/pages/cart/OrderConfirmation';

// Client
import ClientDashboard from '@/pages/client/ClientDashboard';
import MyOrders from '@/pages/client/MyOrders';
import MyReviews from '@/pages/client/MyReviews';
import ClientOrderDetail from '@/pages/client/ClientOrderDetail';
import UserDetail from '@/pages/admin/UserDetail';

// Entreprise
import EntrepriseDashboard from '@/pages/entreprise/EntrepriseDashboard';
import ProductListEntreprise from '@/pages/entreprise/ProductListEntreprise';
import ProductCreate from '@/pages/entreprise/ProductCreate';
import ProductEdit from '@/pages/entreprise/ProductEdit';
import EntrepriseOrders from '@/pages/entreprise/EntrepriseOrders';
import OrderDetail from '@/pages/entreprise/OrderDetail';
import EntrepriseReviews from '@/pages/entreprise/EntrepriseReviews';

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UsersManagement from '@/pages/admin/UsersManagement';
import ProductsManagement from '@/pages/admin/ProductsManagement';
import OrdersManagement from '@/pages/admin/OrdersManagement';
import ReviewsManagement from '@/pages/admin/ReviewsManagement';
import NotificationsManagement from '@/pages/admin/NotificationsManagement';
import CategoryManagement from '@/pages/admin/CategoryManagement';
import NotificationsPage from '@/pages/NotificationsPage';
import NotificationsSent from './pages/admin/NotificationsSent';



function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ==================== ROUTES PUBLIQUES ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<RegisterClient />} />
            <Route path="/register/entreprise" element={<RegisterEntreprise />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/shipping" element={<ShippingReturns />} />
            <Route path="/faq" element={<FAQ />} />


            {/* Routes produits publiques */}
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:slug" element={<ProductDetail />} />

            {/* Routes panier */}
            <Route path="/cart" element={<Cart />} />

            {/* ==================== ROUTES CLIENT ==================== */}
            <Route
              path="/dashboard/client"
              element={
                <ProtectedRoute userType="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/orders"
              element={
                <ProtectedRoute userType="client">
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/myreviews"
              element={
                <ProtectedRoute userType="client">
                  <MyReviews />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/orders/:id"
              element={
                <ProtectedRoute userType="client">
                  <ClientOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute userType="client">
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute userType="client">
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute userType="client">
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />

            {/* ==================== ROUTES ENTREPRISE ==================== */}
            <Route
              path="/dashboard/entreprise"
              element={
                <ProtectedRoute userType="entreprise">
                  <EntrepriseDashboard />
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
              path="/entreprise/products/:slug/edit"
              element={
                <ProtectedRoute userType="entreprise">
                  <ProductEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entreprise/orders"
              element={
                <ProtectedRoute userType="entreprise">
                  <EntrepriseOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entreprise/orders/:id"
              element={
                <ProtectedRoute userType="entreprise">
                  <OrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/entreprise/reviews"
              element={
                <ProtectedRoute userType="entreprise">
                  <EntrepriseReviews />
                </ProtectedRoute>
              }
            />

            {/* ==================== ROUTES ADMIN ==================== */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute userType="admin">
                  <UsersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute userType="admin">
                  <ProductsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute userType="admin">
                  <OrdersManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reviews"
              element={
                <ProtectedRoute userType="admin">
                  <ReviewsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute userType="admin">
                  <NotificationsManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications-sent"
              element={
                <ProtectedRoute userType="admin">
                  <NotificationsSent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute userType="admin">
                  <CategoryManagement />
                </ProtectedRoute>
              }
            />

            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />

            <Route
              path="/admin/users/:id"
              element={
                <ProtectedRoute userType="admin">
                  <UserDetail />
                </ProtectedRoute>
              }
            />

            {/* ==================== ROUTE 404 ==================== */}
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