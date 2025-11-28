import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Empêcher la navigation vers le détail
    e.stopPropagation();

    try {
      setAdding(true);
      await addToCart(product, 1);
      
      // Toast de succès (tu peux ajouter une lib comme react-hot-toast)
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
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {product.image_principale ? (
          <img
            src={product.image_principale}
            alt={product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas d'image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {enPromo && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}%
            </span>
          )}
          {product.en_vedette && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              ⭐ Vedette
            </span>
          )}
        </div>

        {/* Stock */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Plus que {product.stock} !
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold px-4 py-2 rounded">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Entreprise */}
        <p className="text-xs text-gray-500 mb-1">{product.entreprise_nom}</p>

        {/* Nom du produit */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.nom}
        </h3>

        {/* Description courte */}
        {product.description_courte && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description_courte}
          </p>
        )}

        {/* Note */}
        {product.note_moyenne && parseFloat(product.note_moyenne) > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{product.note_moyenne}</span>
            <span className="text-xs text-gray-500">(avis)</span>
          </div>
        )}

        {/* Prix */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xl font-bold text-blue-600">{prix.toFixed(2)} Ar</p>
            {enPromo && (
              <p className="text-sm text-gray-500 line-through">
                {prixOriginal.toFixed(2)} Ar
              </p>
            )}
          </div>
        </div>

        {/* Bouton Ajouter au panier */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          {adding ? 'Ajout...' : product.stock === 0 ? 'Rupture' : 'Ajouter au panier'}
        </button>
      </div>
    </Link>
  );
}
