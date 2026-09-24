import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Loader2, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';
import BlobImage from '@/components/ui/BlobImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    try {
      setAdding(true);
      await addToCart(product, 1);
      toast.success(`${product.nom} ajouté au panier`, { action: { label: 'Voir le panier', to: '/cart' } });
    } catch (error) {
      toast.error(error.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAdding(false);
    }
  };

  const prix = parseFloat(product.prix_final || product.prix);
  const prixOriginal = product.prix_promo ? parseFloat(product.prix) : null;
  const enPromo = product.en_promotion && prixOriginal && prixOriginal > prix;
  const note = parseFloat(product.note_moyenne) || 0;
  const rupture = product.stock === 0;

  const placeholder = (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-300">
      <ImageOff className="w-8 h-8" />
      <span className="text-xs">Pas d'image</span>
    </div>
  );

  return (
    <article className="fade-up bg-white rounded-lg border border-gray-200 overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <Link to={`/products/${product.slug}`} className="flex flex-col flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-t-lg">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.image_principale_id ? (
            <BlobImage
              imageId={product.image_principale_id}
              alt={product.nom}
              lazy
              fallback={placeholder}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            placeholder
          )}

          {enPromo && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}%
            </span>
          )}

          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute bottom-2 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
              Plus que {product.stock}
            </span>
          )}

          {rupture && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-3 pb-0 space-y-2 flex-1">
          <p className="text-xs text-gray-500 truncate">{product.entreprise_nom}</p>

          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
            {product.nom}
          </h3>

          {note > 0 && (
            <div className="flex items-center gap-1" aria-label={`Note ${note} sur 5`}>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(note) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">{note.toFixed(1)}</span>
            </div>
          )}

          <div className="flex flex-wrap items-baseline gap-x-2 pt-1">
            <p className="text-lg font-bold text-gray-900">{prix.toLocaleString('fr-FR')} Ar</p>
            {enPromo && (
              <p className="text-sm text-gray-400 line-through">{prixOriginal.toLocaleString('fr-FR')} Ar</p>
            )}
          </div>
        </div>
      </Link>

      {/* Bouton hors du lien : HTML valide et accessible au clavier */}
      <div className="p-3 pt-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || rupture}
          className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white py-2.5 rounded-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium transition-all"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {rupture ? 'Rupture' : adding ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse" aria-hidden="true">
      <div className="aspect-square bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
        <div className="h-6 w-1/3 bg-gray-100 rounded mt-2" />
        <div className="h-10 w-full bg-gray-100 rounded-lg mt-3" />
      </div>
    </div>
  );
}
