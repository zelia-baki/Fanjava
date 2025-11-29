import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Package, 
  Shield, 
  FolderTree,
  Menu,
  X
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl sm:text-2xl font-bold text-blue-600 flex items-center"
            onClick={closeMobileMenu}
          >
            <span className="hidden sm:inline">FanJava</span>
            <span className="sm:hidden">FJ</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 transition">
              Produits
            </Link>

            {user ? (
              <>
                {/* ADMIN */}
                {user.user_type === 'admin' && (
                  <>
                    <Link 
                      to="/admin/categories" 
                      className="text-gray-700 hover:text-blue-600 flex items-center transition"
                    >
                      <FolderTree className="w-4 h-4 mr-1" />
                      <span className="hidden xl:inline">Catégories</span>
                    </Link>
                    <Link 
                      to="/admin/dashboard" 
                      className="text-gray-700 hover:text-blue-600 flex items-center transition"
                    >
                      <Shield className="w-4 h-4 mr-1" />
                      <span className="hidden xl:inline">Admin</span>
                    </Link>
                  </>
                )}

                {/* ENTREPRISE */}
                {user.user_type === 'entreprise' && (
                  <Link 
                    to="/dashboard/entreprise" 
                    className="text-gray-700 hover:text-blue-600 flex items-center transition"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    <span className="hidden xl:inline">Dashboard</span>
                  </Link>
                )}

                {/* CLIENT */}
                {user.user_type === 'client' && (
                  <>
                    <Link 
                      to="/cart" 
                      className="text-gray-700 hover:text-blue-600 relative transition"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {getItemCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                          {getItemCount()}
                        </span>
                      )}
                    </Link>

                    <Link 
                      to="/dashboard/client" 
                      className="text-gray-700 hover:text-blue-600 flex items-center transition"
                    >
                      <User className="w-4 h-4 mr-1" />
                      <span className="hidden xl:inline">Mon compte</span>
                    </Link>
                  </>
                )}

                {/* Cloche notifications - pour TOUS les utilisateurs connectés */}
                <NotificationBell />

                {/* Déconnexion */}
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 flex items-center transition"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden xl:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                {/* Non connecté */}
                <Link 
                  to="/cart" 
                  className="text-gray-700 hover:text-blue-600 relative transition"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                      {getItemCount()}
                    </span>
                  )}
                </Link>

                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Connexion
                </Link>
                
                <Link 
                  to="/register/client" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </nav>

          {/* Icônes mobile */}
          <div className="flex lg:hidden items-center space-x-3 sm:space-x-4">
            {/* Panier - visible pour clients et non connectés */}
            {(user?.user_type === 'client' || !user) && (
              <Link 
                to="/cart" 
                className="text-gray-700 hover:text-blue-600 relative transition"
                onClick={closeMobileMenu}
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {getItemCount()}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications - pour tous les utilisateurs connectés */}
            {user && <NotificationBell />}

            {/* Menu hamburger */}
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 p-2 -mr-2"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div 
        className={`lg:hidden bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <nav className="px-4 py-4 space-y-2">
          <Link 
            to="/" 
            className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
            onClick={closeMobileMenu}
          >
            Produits
          </Link>

          {user ? (
            <>
              {/* Menu ADMIN */}
              {user.user_type === 'admin' && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Dashboard Admin</span>
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    <User className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Gestion Utilisateurs</span>
                  </Link>
                  <Link 
                    to="/admin/categories" 
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    <FolderTree className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Catégories</span>
                  </Link>
                </>
              )}

              {/* Menu ENTREPRISE */}
              {user.user_type === 'entreprise' && (
                <Link 
                  to="/dashboard/entreprise" 
                  className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
                  onClick={closeMobileMenu}
                >
                  <Package className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* Menu CLIENT */}
              {user.user_type === 'client' && (
                <Link 
                  to="/dashboard/client" 
                  className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
                  onClick={closeMobileMenu}
                >
                  <User className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Mon Compte</span>
                </Link>
              )}

              {/* Séparateur */}
              <div className="border-t border-gray-200 my-3"></div>

              {/* Info utilisateur */}
              <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Connecté en tant que</p>
                <p className="text-sm font-semibold text-blue-700">
                  {user.username}
                </p>
                <p className="text-xs text-blue-600 capitalize mt-0.5">
                  {user.user_type === 'admin' && '🛡️ Administrateur'}
                  {user.user_type === 'entreprise' && '🏢 Entreprise'}
                  {user.user_type === 'client' && '👤 Client'}
                </p>
              </div>

              {/* Déconnexion */}
              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="w-full flex items-center text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-lg transition font-medium"
              >
                <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              {/* Menu non connecté */}
              <Link 
                to="/login" 
                className="block text-gray-700 hover:text-blue-600 hover:bg-gray-50 px-3 py-2.5 rounded-lg transition"
                onClick={closeMobileMenu}
              >
                Connexion
              </Link>
              <Link 
                to="/register/client" 
                className="block bg-blue-600 text-white text-center px-3 py-2.5 rounded-lg hover:bg-blue-700 transition font-semibold"
                onClick={closeMobileMenu}
              >
                Créer un compte client
              </Link>
              <Link 
                to="/register/entreprise" 
                className="block bg-purple-600 text-white text-center px-3 py-2.5 rounded-lg hover:bg-purple-700 transition font-semibold"
                onClick={closeMobileMenu}
              >
                Devenir vendeur
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}