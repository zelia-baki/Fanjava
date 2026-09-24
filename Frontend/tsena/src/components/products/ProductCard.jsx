import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Loader2, ImageOff } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';
import BlobImage from '@/components/ui/BlobImage';
import { formatPrix } from '@/utils/format';

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
    <article className="fade-up group bg-white flex flex-col border border-gray-200 hover:border-gray-900 hover:shadow-[6px_6px_0_0_rgba(17,24,39,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-200">
      <Link to={`/products/${product.slug}`} className="flex flex-col flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
        {/* Image */}
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.image_principale_id ? (
            <BlobImage
              imageId={product.image_principale_id}
              alt={product.nom}
              lazy
              fallback={placeholder}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            placeholder
          )}

          <div className="absolute top-0 left-0 flex flex-col items-start">
            {enPromo && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1">
                -{Math.round(((prixOriginal - prix) / prixOriginal) * 100)}%
              </span>
            )}
            {product.en_vedette && (
              <span className="bg-gray-950 text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1">
                Coup de cœur
              </span>
            )}
          </div>

          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute bottom-0 right-0 bg-white/95 text-orange-700 text-xs font-semibold px-2.5 py-1">
              Plus que {product.stock}
            </span>
          )}

          {rupture && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-gray-950 text-white font-semibold uppercase tracking-wider px-4 py-2 text-xs">
                Épuisé
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="px-3 sm:px-4 pt-3 sm:pt-4 flex-1 flex flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 truncate">{product.entreprise_nom}</p>

          <h3 className="mt-1 font-sans font-medium text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:underline underline-offset-2">
            {product.nom}
          </h3>

          {note > 0 && (
            <div className="flex items-center gap-1 mt-1.5" aria-label={`Note ${note} sur 5`}>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.round(note) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">{note.toFixed(1)}</span>
            </div>
          )}

          <div className="mt-auto pt-3 flex flex-wrap items-baseline gap-x-2">
            <p className={`font-display text-lg sm:text-xl font-extrabold ${enPromo ? 'text-orange-600' : 'text-gray-950'}`}>
              {formatPrix(prix)}
            </p>
            {enPromo && (
              <p className="text-xs sm:text-sm text-gray-400 line-through">{formatPrix(prixOriginal)}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Bouton hors du lien : HTML valide et accessible au clavier */}
      <div className="p-3 sm:p-4 pt-3">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || rupture}
          className="w-full h-10 sm:h-11 bg-gray-950 hover:bg-emerald-600 active:scale-[0.98] text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all"
        >
          {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
          {rupture ? 'Indisponible' : adding ? 'Ajout…' : (
            <>
              <span>
                Ajouter<span className="hidden xl:inline"> au panier</span>
              </span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 overflow-hidden animate-pulse" aria-hidden="true">
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
