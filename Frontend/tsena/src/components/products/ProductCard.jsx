import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setAdding(true);
      await addToCart(product, 1);
      alert(`${product.nom} ajouté au panier !`);
    } catch (error) {
      alert(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  const prix = parseFloat(product.prix_final || product.prix);
  const prixOriginal = product.prix_promo ? parseFloat(product.prix) : null;
  const enPromo = product.en_promotion && prixOriginal;

  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-white rounded-xl shadow-lg overflow-hidden group transition-all transform hover:scale-105 hover:shadow-2xl relative"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {product.image_principale ? (
          <img
            src={product.image_principale}
            alt={product.nom}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas d'image
          </div>
        )}

        {/* Badges animés */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {enPromo && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded animate-pulse shadow-md">
              -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}%
            </span>
          )}
          {product.en_vedette && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded animate-bounce shadow-md flex items-center gap-1">
              ⭐ Vedette
              <Sparkles className="w-3 h-3 animate-ping text-yellow-200" />
            </span>
          )}
        </div>

        {/* Stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded animate-pulse shadow-md">
            Plus que {product.stock} !
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-2 rounded animate-pulse shadow-lg">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-500">{product.entreprise_nom}</p>
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.nom}
        </h3>
        {product.description_courte && (
          <p className="text-sm text-gray-600 line-clamp-2">{product.description_courte}</p>
        )}

        {/* Note */}
        {product.note_moyenne && parseFloat(product.note_moyenne) > 0 && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span className="text-sm font-semibold">{product.note_moyenne}</span>
            <span className="text-xs text-gray-500">(avis)</span>
          </div>
        )}

        {/* Prix */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-blue-600">{prix.toFixed(2)} Ar</p>
            {enPromo && <p className="text-sm text-gray-500 line-through">{prixOriginal.toFixed(2)} Ar</p>}
          </div>
        </div>

        {/* Bouton Ajouter */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform transition-all active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? 'Ajout...' : product.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
        </button>
      </div>

      {/* Animations supplémentaires pour mobile */}
      <style>
        {`
          @media (max-width: 768px) {
            .group:hover img {
              transform: scale(1.03);
            }
          }
        `}
      </style>
    </Link>
  );
}
