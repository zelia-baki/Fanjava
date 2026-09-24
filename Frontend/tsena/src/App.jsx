// src/App.jsx - VERSION AVEC ROUTES ADMIN

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import PageLoader from '@/components/ui/PageLoader';
import { applyRouteSeo } from '@/utils/seo';

// Pages informatives
const Contact = lazy(() => import('@/pages/static/Contact'));
const Terms = lazy(() => import('@/pages/static/Terms'));
const Privacy = lazy(() => import('@/pages/static/Privacy'));
const ShippingReturns = lazy(() => import('@/pages/static/ShippingReturns'));
const FAQ = lazy(() => import('@/pages/static/FAQ'));

// Auth
const Login = lazy(() => import('@/pages/auth/Login'));
const RegisterClient = lazy(() => import('@/pages/auth/RegisterClient'));
const RegisterEntreprise = lazy(() => import('@/pages/auth/RegisterEntreprise'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('@/pages/auth/VerifyEmail'));

// Public - Products
import ProductList from '@/pages/products/ProductList';
import ProductDetail from '@/pages/products/ProductDetail';
const ProfileEdit = lazy(() => import('@/pages/client/ProfileEdit'));

// Cart & Checkout
const Cart = lazy(() => import('@/pages/cart/Cart'));
const Checkout = lazy(() => import('@/pages/cart/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/cart/OrderConfirmation'));

// Client
const ClientDashboard = lazy(() => import('@/pages/client/ClientDashboard'));
const MyOrders = lazy(() => import('@/pages/client/MyOrders'));
const MyReviews = lazy(() => import('@/pages/client/MyReviews'));
const ClientOrderDetail = lazy(() => import('@/pages/client/ClientOrderDetail'));
const UserDetail = lazy(() => import('@/pages/admin/UserDetail'));

// Entreprise
const EntrepriseDashboard = lazy(() => import('@/pages/entreprise/EntrepriseDashboard'));
const ProductListEntreprise = lazy(() => import('@/pages/entreprise/ProductListEntreprise'));
const ProductCreate = lazy(() => import('@/pages/entreprise/ProductCreate'));
const ProductEdit = lazy(() => import('@/pages/entreprise/ProductEdit'));
const EntrepriseOrders = lazy(() => import('@/pages/entreprise/EntrepriseOrders'));
const OrderDetail = lazy(() => import('@/pages/entreprise/OrderDetail'));
const EntrepriseReviews = lazy(() => import('@/pages/entreprise/EntrepriseReviews'));

// Admin
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UsersManagement = lazy(() => import('@/pages/admin/UsersManagement'));
const ProductsManagement = lazy(() => import('@/pages/admin/ProductsManagement'));
const OrdersManagement = lazy(() => import('@/pages/admin/OrdersManagement'));
const ReviewsManagement = lazy(() => import('@/pages/admin/ReviewsManagement'));
const NotificationsManagement = lazy(() => import('@/pages/admin/NotificationsManagement'));
const CategoryManagement = lazy(() => import('@/pages/admin/CategoryManagement'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const NotificationsSent = lazy(() => import('./pages/admin/NotificationsSent'));



// Titre, description, canonical et robots par défaut de chaque URL.
// Placé avant <Routes> : ses effets s'exécutent avant ceux de la page, qui peut les préciser.
function RouteSeo() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyRouteSeo(pathname);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <RouteSeo />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ==================== ROUTES PUBLIQUES ==================== */}
            <Route path="/login" element={<Login />} />
            <Route path="/register/client" element={<RegisterClient />} />
            <Route path="/register/entreprise" element={<RegisterEntreprise />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
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
              path="/admin/orders/:id"
              element={
                <ProtectedRoute userType="admin">
                  <OrderDetail />
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
          </Suspense>
        </CartProvider>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;