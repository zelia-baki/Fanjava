import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import useCategories from '@/hooks/useCategories';
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Shield,
  FolderTree,
  Menu,
  X,
  Search,
  Truck,
  ShieldCheck,
  BadgeCheck,
  Store,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

function CartLink({ count, onClick }) {
  return (
    <Link
      to="/cart"
      onClick={onClick}
      aria-label={`Panier${count ? ` (${count} article${count > 1 ? 's' : ''})` : ''}`}
      className="relative flex items-center gap-2 text-gray-900 hover:text-emerald-700 transition-colors"
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="hidden xl:inline text-sm font-semibold">Panier</span>
      {count > 0 && (
        <span className="absolute -top-2 left-4 bg-orange-500 text-white text-[11px] font-bold min-w-5 h-5 px-1 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}

function SearchForm({ className = '', onDone }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') || '');

  // Reste aligné sur l'URL (effacement des filtres, navigation…)
  useEffect(() => {
    setValue(searchParams.get('search') || '');
  }, [searchParams]);

  const submit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set('search', value.trim());
    navigate(`/${params.toString() ? `?${params}` : ''}`);
    onDone?.();
  };

  return (
    <form onSubmit={submit} role="search" className={`flex ${className}`}>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Rechercher un produit, une marque…"
        aria-label="Rechercher un produit"
        className="flex-1 min-w-0 h-11 px-4 text-sm bg-white border-2 border-gray-900 border-r-0 focus:outline-none focus:border-emerald-600 placeholder:text-gray-400"
      />
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="h-11 px-5 bg-gray-900 hover:bg-emerald-600 text-white flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        <Search className="w-5 h-5" />
        <span className="hidden lg:inline">Rechercher</span>
      </button>
    </form>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const categories = useCategories();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const count = getItemCount();
  const showCart = !user || user.user_type === 'client';

  const onHome = pathname === '/';
  const categorieActive = onHome ? searchParams.get('categorie') : null;
  const promoActive = onHome && searchParams.get('en_promotion') === 'true';
  const toutActif = onHome && !categorieActive && !promoActive;

  const navCategorie = (actif) =>
    `shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
      actif ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
    }`;

  const mobileLink = 'flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-50 font-medium border-b border-gray-100';

  return (
    <header className="relative lg:sticky top-0 z-50 bg-white">
      {/* Bandeau d'arguments */}
      <div className="bg-gray-950 text-gray-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center sm:justify-between gap-6">
          <p className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-emerald-400" />
            Livraison partout à Madagascar
          </p>
          <p className="hidden sm:flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Paiement sécurisé
          </p>
          <p className="hidden md:flex items-center gap-2">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            Vendeurs vérifiés
          </p>
          {!user && (
            <Link to="/register/entreprise" className="hidden lg:flex items-center gap-2 text-orange-300 hover:text-orange-200 font-semibold">
              <Store className="w-3.5 h-3.5" />
              Vendre sur FanJava
            </Link>
          )}
        </div>
      </div>

      {/* Barre principale */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center gap-4 lg:gap-8">
          <Link to="/" onClick={closeMobileMenu} className="shrink-0 flex items-baseline font-display" aria-label="FanJava.mg, accueil">
            <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-950">FANJAVA</span>
            <span className="text-base lg:text-lg font-bold text-emerald-600">.mg</span>
          </Link>

          <SearchForm className="hidden md:flex flex-1 max-w-2xl" />

          {/* Actions desktop */}
          <nav className="hidden lg:flex items-center gap-6 ml-auto" aria-label="Compte">
            {user ? (
              <>
                {user.user_type === 'admin' && (
                  <>
                    <Link to="/admin/categories" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-emerald-700">
                      <FolderTree className="w-4 h-4" />
                      <span className="hidden xl:inline">Catégories</span>
                    </Link>
                    <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-emerald-700">
                      <Shield className="w-4 h-4" />
                      <span className="hidden xl:inline">Admin</span>
                    </Link>
                  </>
                )}
                {user.user_type === 'entreprise' && (
                  <Link to="/dashboard/entreprise" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-emerald-700">
                    <Package className="w-4 h-4" />
                    <span className="hidden xl:inline">Ma boutique</span>
                  </Link>
                )}
                {user.user_type === 'client' && (
                  <Link to="/dashboard/client" className="flex items-center gap-2 text-gray-900 hover:text-emerald-700">
                    <User className="w-6 h-6" />
                    <span className="hidden xl:flex flex-col leading-tight">
                      <span className="text-[11px] text-gray-500">Bonjour {user.username}</span>
                      <span className="text-sm font-semibold">Mon compte</span>
                    </span>
                  </Link>
                )}
                <NotificationBell />
                {showCart && <CartLink count={count} />}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600"
                  aria-label="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 text-gray-900 hover:text-emerald-700">
                  <User className="w-6 h-6" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-[11px] text-gray-500">Bienvenue</span>
                    <span className="text-sm font-semibold">Se connecter</span>
                  </span>
                </Link>
                <CartLink count={count} />
                <Link
                  to="/register/client"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 h-11 flex items-center transition-colors"
                >
                  Créer un compte
                </Link>
              </>
            )}
          </nav>

          {/* Actions mobile */}
          <div className="flex lg:hidden items-center gap-4 ml-auto">
            {user && <NotificationBell />}
            {showCart && <CartLink count={count} onClick={closeMobileMenu} />}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 -mr-2 text-gray-900"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Recherche mobile */}
        <div className="md:hidden px-4 pb-3">
          <SearchForm onDone={closeMobileMenu} />
        </div>
      </div>

      {/* Barre de catégories */}
      <nav className="border-b border-gray-200 bg-white" aria-label="Catégories">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 flex overflow-x-auto no-scrollbar">
          <Link to="/" className={navCategorie(toutActif)}>
            Tous les produits
          </Link>
          <Link to="/?en_promotion=true" className={`${navCategorie(promoActive)} ${promoActive ? '' : 'text-orange-600'}`}>
            Promotions
          </Link>
          {categories
            .filter((cat) => !cat.parent)
            .map((cat) => (
              <Link key={cat.id} to={`/?categorie=${cat.id}`} className={navCategorie(categorieActive === String(cat.id))}>
                {cat.nom}
              </Link>
            ))}
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute inset-x-0 top-full bg-white border-b border-gray-200 shadow-xl max-h-[70vh] overflow-y-auto">
          <nav aria-label="Menu mobile">
            {user ? (
              <>
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="text-xs text-gray-500">Connecté en tant que</p>
                  <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                </div>
                {user.user_type === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className={mobileLink} onClick={closeMobileMenu}>
                      <Shield className="w-5 h-5" /> Tableau de bord admin
                    </Link>
                    <Link to="/admin/users" className={mobileLink} onClick={closeMobileMenu}>
                      <User className="w-5 h-5" /> Utilisateurs
                    </Link>
                    <Link to="/admin/categories" className={mobileLink} onClick={closeMobileMenu}>
                      <FolderTree className="w-5 h-5" /> Catégories
                    </Link>
                  </>
                )}
                {user.user_type === 'entreprise' && (
                  <Link to="/dashboard/entreprise" className={mobileLink} onClick={closeMobileMenu}>
                    <Package className="w-5 h-5" /> Ma boutique
                  </Link>
                )}
                {user.user_type === 'client' && (
                  <Link to="/dashboard/client" className={mobileLink} onClick={closeMobileMenu}>
                    <User className="w-5 h-5" /> Mon compte
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className={`${mobileLink} w-full text-red-600`}
                >
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </>
            ) : (
              <div className="p-4 grid gap-2">
                <Link to="/login" onClick={closeMobileMenu} className="h-12 flex items-center justify-center border-2 border-gray-900 font-semibold text-gray-900">
                  Se connecter
                </Link>
                <Link to="/register/client" onClick={closeMobileMenu} className="h-12 flex items-center justify-center bg-emerald-600 text-white font-semibold">
                  Créer un compte client
                </Link>
                <Link to="/register/entreprise" onClick={closeMobileMenu} className="h-12 flex items-center justify-center bg-orange-500 text-white font-semibold">
                  Devenir vendeur
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
