import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
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
      className="bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image_principale ? (
          <img
            src={product.image_principale}
            alt={product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            Pas d'image
          </div>
        )}

        {/* Badges minimalistes */}
        {enPromo && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}%
          </span>
        )}

        {/* Stock faible */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
            Plus que {product.stock}
          </div>
        )}

        {/* Rupture de stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-3 space-y-2">
        {/* Vendeur */}
        <p className="text-xs text-gray-500 truncate">{product.entreprise_nom}</p>

        {/* Titre */}
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
          {product.nom}
        </h3>

        {/* Note */}
        {product.note_moyenne && parseFloat(product.note_moyenne) > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(parseFloat(product.note_moyenne))
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">{product.note_moyenne}</span>
          </div>
        )}

        {/* Prix */}
        <div className="pt-1">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-bold text-gray-900">{prix.toLocaleString()} Ar</p>
            {enPromo && (
              <p className="text-sm text-gray-400 line-through">{prixOriginal.toLocaleString()} Ar</p>
            )}
          </div>
        </div>

        {/* Bouton Ajouter - ORANGE ET ÉLÉGANT */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-colors mt-3"
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? 'Ajout...' : product.stock === 0 ? 'Rupture' : 'Ajouter'}
        </button>
      </div>
    </Link>
  );
}
