import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            FanJava
          </Link>

          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Produits
            </Link>

            {user ? (
              <>
                {user.user_type === 'entreprise' && (
                  <Link to="/dashboard/entreprise" className="text-gray-700 hover:text-blue-600 flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                )}

                {user.user_type === 'client' && (
                  <>
                    <Link to="/cart" className="text-gray-700 hover:text-blue-600 relative">
                      <ShoppingCart className="w-5 h-5" />
                      {getItemCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {getItemCount()}
                        </span>
                      )}
                    </Link>

                    <Link to="/dashboard/client" className="text-gray-700 hover:text-blue-600 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Mon compte
                    </Link>
                  </>
                )}

                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/cart" className="text-gray-700 hover:text-blue-600 relative">
                  <ShoppingCart className="w-5 h-5" />
                  {getItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getItemCount()}
                    </span>
                  )}
                </Link>

                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Connexion
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}