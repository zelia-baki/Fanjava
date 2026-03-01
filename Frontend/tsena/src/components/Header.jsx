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
  X,
  Sparkles,
  Zap
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
    <>
      {/* Styles d'animation */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.8));
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-slideDown,
          .animate-fadeIn,
          .animate-float,
          .animate-twinkle,
          .animate-glow {
            animation: none;
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>

      <header className="relative sticky top-0 z-50 shadow-lg animate-slideDown">
        {/* Icônes décoratives animées */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
          <div className="absolute top-2 left-1/4 animate-float animate-twinkle" style={{ animationDelay: '0s' }}>
            <Sparkles className="w-4 h-4 text-emerald-400/60" />
          </div>
          <div className="absolute top-3 right-1/3 animate-float animate-twinkle" style={{ animationDelay: '0.5s' }}>
            <Zap className="w-3 h-3 text-orange-500/50" />
          </div>
          <div className="absolute top-2 right-1/4 animate-float animate-twinkle" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-4 h-4 text-emerald-300/60" />
          </div>
          <div className="absolute top-4 left-1/3 animate-float animate-twinkle" style={{ animationDelay: '1.5s' }}>
            <Zap className="w-3 h-3 text-orange-400/50" />
          </div>
        </div>

        {/* 🎨 BACKGROUND ANIMÉ */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/backgrounds/header_wave_animated.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        {/* Overlay léger pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"></div>

        {/* Contenu du header */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo texte avec effet hover */}
          {/* Logo texte avec effet hover */}
{/* Logo texte avec effet hover */}
{/* Logo texte discret et raffiné */}
<Link 
  to="/" 
  className="flex items-center space-x-0.5 hover:opacity-80 transition-opacity"
  onClick={closeMobileMenu}
>
  <span className="text-xl sm:text-2xl font-medium text-gray-800 tracking-tight">
    FanJava
  </span>
  <span className="text-sm sm:text-base font-normal text-gray-500">
    .mg
  </span>
</Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-emerald-600 transition-all hover:scale-105 font-medium animate-fadeIn"
                style={{ animationDelay: '0.2s' }}
              >
                Produits
              </Link>

              {user ? (
                <>
                  {/* ADMIN */}
                  {user.user_type === 'admin' && (
                    <>
                      <Link 
                        to="/admin/categories" 
                        className="text-gray-700 hover:text-emerald-600 flex items-center transition-all hover:scale-105 animate-fadeIn"
                        style={{ animationDelay: '0.3s' }}
                      >
                        <FolderTree className="w-4 h-4 mr-1" />
                        <span className="hidden xl:inline">Catégories</span>
                      </Link>
                      <Link 
                        to="/admin/dashboard" 
                        className="text-gray-700 hover:text-emerald-600 flex items-center transition-all hover:scale-105 animate-fadeIn"
                        style={{ animationDelay: '0.4s' }}
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
                      className="text-gray-700 hover:text-emerald-600 flex items-center transition-all hover:scale-105 animate-fadeIn"
                      style={{ animationDelay: '0.3s' }}
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
                        className="text-gray-700 hover:text-emerald-600 relative transition-all hover:scale-105 animate-fadeIn"
                        style={{ animationDelay: '0.3s' }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {getItemCount() > 0 && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                            {getItemCount()}
                          </span>
                        )}
                      </Link>

                      <Link 
                        to="/dashboard/client" 
                        className="text-gray-700 hover:text-emerald-600 flex items-center transition-all hover:scale-105 animate-fadeIn"
                        style={{ animationDelay: '0.4s' }}
                      >
                        <User className="w-4 h-4 mr-1" />
                        <span className="hidden xl:inline">Mon compte</span>
                      </Link>
                    </>
                  )}

                  {/* Cloche notifications */}
                  <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                    <NotificationBell />
                  </div>

                  {/* Déconnexion */}
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-red-600 flex items-center transition-all hover:scale-105 animate-fadeIn"
                    style={{ animationDelay: '0.6s' }}
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
                    className="text-gray-700 hover:text-emerald-600 relative transition-all hover:scale-105 animate-fadeIn"
                    style={{ animationDelay: '0.3s' }}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {getItemCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg animate-pulse">
                        {getItemCount()}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-emerald-600 transition-all hover:scale-105 font-medium animate-fadeIn"
                    style={{ animationDelay: '0.4s' }}
                  >
                    Connexion
                  </Link>
                  
                  <Link 
                    to="/register/client" 
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all hover:scale-105 hover:shadow-lg shadow-md font-medium animate-fadeIn"
                    style={{ animationDelay: '0.5s' }}
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </nav>

            {/* Icônes mobile */}
            <div className="flex lg:hidden items-center space-x-3 sm:space-x-4">
              {/* Panier */}
              {(user?.user_type === 'client' || !user) && (
                <Link 
                  to="/cart" 
                  className="text-gray-700 hover:text-emerald-600 relative transition-all hover:scale-105 animate-fadeIn"
                  onClick={closeMobileMenu}
                  style={{ animationDelay: '0.2s' }}
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-lg">
                      {getItemCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* Notifications */}
              {user && (
                <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                  <NotificationBell />
                </div>
              )}

              {/* Menu hamburger */}
              <button
                onClick={toggleMobileMenu}
                className="text-gray-700 hover:text-emerald-600 p-2 -mr-2 hover:scale-105 transition-all animate-fadeIn"
                aria-label="Menu"
                style={{ animationDelay: '0.4s' }}
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
          className={`lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'max-h-screen opacity-100' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <nav className="px-4 py-4 space-y-2">
            <Link 
              to="/" 
              className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition font-medium"
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
                      className="flex items-center text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition"
                      onClick={closeMobileMenu}
                    >
                      <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span>Dashboard Admin</span>
                    </Link>
                    <Link 
                      to="/admin/users" 
                      className="flex items-center text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition"
                      onClick={closeMobileMenu}
                    >
                      <User className="w-5 h-5 mr-3 flex-shrink-0" />
                      <span>Gestion Utilisateurs</span>
                    </Link>
                    <Link 
                      to="/admin/categories" 
                      className="flex items-center text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition"
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
                    className="flex items-center text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition"
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
                    className="flex items-center text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition"
                    onClick={closeMobileMenu}
                  >
                    <User className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>Mon Compte</span>
                  </Link>
                )}

                {/* Séparateur */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* Info utilisateur */}
                <div className="px-3 py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <p className="text-xs text-gray-600 mb-1">Connecté en tant que</p>
                  <p className="text-sm font-semibold text-emerald-700">
                    {user.username}
                  </p>
                  <p className="text-xs text-emerald-600 capitalize mt-0.5">
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
                  className="block text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2.5 rounded-lg transition font-medium"
                  onClick={closeMobileMenu}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register/client" 
                  className="block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-center px-3 py-2.5 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition font-semibold shadow-md"
                  onClick={closeMobileMenu}
                >
                  Créer un compte client
                </Link>
                <Link 
                  to="/register/entreprise" 
                  className="block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center px-3 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold shadow-md"
                  onClick={closeMobileMenu}
                >
                  Devenir vendeur
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
