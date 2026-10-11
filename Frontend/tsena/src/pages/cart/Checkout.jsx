import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import MainLayout from '@/layouts/MainLayout';
import PageLoader from '@/components/ui/PageLoader';
import BlobImage from '@/components/ui/BlobImage';
import { Input, Textarea, FormAlert, SubmitButton } from '@/components/ui/Form';
import { formatPrix } from '@/utils/format';
import { ArrowLeft, Check, Home, MapPin, Phone, ShoppingBag, Truck, Wallet } from 'lucide-react';

const ETAPES = ['Panier', 'Livraison', 'Confirmation'];

function Etapes({ courante }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-3 text-sm mb-8" aria-label="Étapes de la commande">
      {ETAPES.map((etape, i) => {
        const faite = i < courante;
        const active = i === courante;
        return (
          <li key={etape} className="flex items-center gap-2 sm:gap-3" aria-current={active ? 'step' : undefined}>
            <span
              className={`w-7 h-7 flex items-center justify-center font-bold text-xs ${
                active ? 'bg-gray-950 text-white' : faite ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {faite ? <Check className="w-4 h-4" aria-hidden="true" /> : i + 1}
            </span>
            <span className={active ? 'font-semibold text-gray-950' : 'text-gray-500'}>{etape}</span>
            {i < ETAPES.length - 1 && <span className="w-6 sm:w-10 h-px bg-gray-300" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getTotal, fetchCart, ready } = useCart();
  const { user, loading: authLoading } = useAuth();
  const errorRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    adresse_livraison: '',
    ville_livraison: '',
    code_postal_livraison: '',
    pays_livraison: 'Madagascar',
    telephone_livraison: '',
    note_client: '',
    frais_livraison: '0.00',
  });

  // Préremplit avec l'adresse et le téléphone du profil client (sans écraser une saisie)
  useEffect(() => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      adresse_livraison: prev.adresse_livraison || user.client?.adresse_livraison || '',
      ville_livraison: prev.ville_livraison || user.client?.ville || '',
      code_postal_livraison: prev.code_postal_livraison || user.client?.code_postal || '',
      telephone_livraison: prev.telephone_livraison || user.phone || '',
    }));
  }, [user]);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  if (authLoading || !ready) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  if (user?.user_type !== 'client') {
    return <Navigate to="/login" replace state={{ from: { pathname: '/checkout' } }} />;
  }

  if (cart.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <ShoppingBag className="w-12 h-12 text-gray-300" aria-hidden="true" />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-gray-950">Votre panier est vide</h1>
          <p className="mt-2 text-gray-600">Ajoutez des produits avant de passer commande.</p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center gap-2 h-12 px-6 bg-gray-950 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            Découvrir les produits
          </Link>
        </div>
      </MainLayout>
    );
  }

  const set = (name) => (e) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.adresse_livraison.trim()) newErrors.adresse_livraison = "Indiquez l'adresse de livraison.";
    if (!formData.ville_livraison.trim()) newErrors.ville_livraison = 'Indiquez la ville.';
    if (!formData.code_postal_livraison.trim()) newErrors.code_postal_livraison = 'Indiquez le code postal.';
    if (!formData.telephone_livraison.trim()) {
      newErrors.telephone_livraison = 'Le vendeur a besoin de votre téléphone pour la livraison.';
    } else if (!/^[0-9\s+()-]{8,}$/.test(formData.telephone_livraison.trim())) {
      newErrors.telephone_livraison = 'Numéro invalide. Exemple : 034 12 345 67';
    }
    setErrors(newErrors);
    const premier = Object.keys(newErrors)[0];
    if (premier) document.getElementById(premier)?.focus();
    return !premier;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrderFromCart(formData);
      navigate('/order-confirmation', {
        state: { orders: response.commandes, message: response.message },
      });
      // Le serveur a vidé le panier : on resynchronise l'état local
      fetchCart();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object' && !data.error) {
        // Erreurs de validation champ par champ renvoyées par l'API
        setErrors(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, [].concat(v).join(' ')])));
        setError('Certaines informations sont à corriger.');
      } else {
        setError(data?.error || 'La commande n’a pas pu être créée. Réessayez dans quelques instants.');
      }
      // Le panier a pu changer côté serveur (stock, produit retiré)
      fetchCart();
    } finally {
      setLoading(false);
    }
  };

  const sousTotal = getTotal();
  const nbArticles = cart.reduce((sum, item) => sum + (item.quantite || 0), 0);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Link to="/cart" className="inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-gray-700 hover:text-gray-950 mb-4">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Retour au panier
        </Link>

        <Etapes courante={1} />

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950 mb-8">Livraison</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-12 items-start">
          {/* Formulaire */}
          <form onSubmit={handleSubmit} noValidate className="space-y-8 order-2 lg:order-1">
            {error && (
              <div ref={errorRef} tabIndex={-1} className="outline-none">
                <FormAlert title={error} />
              </div>
            )}

            <fieldset className="space-y-5">
              <legend className="w-full mb-5 pb-3 border-b-2 border-gray-950 font-display text-lg font-bold text-gray-950">
                Adresse de livraison
              </legend>
              <Textarea
                id="adresse_livraison"
                label="Adresse"
                required
                rows={2}
                autoComplete="street-address"
                placeholder="Lot, rue, quartier…"
                error={errors.adresse_livraison}
                value={formData.adresse_livraison}
                onChange={set('adresse_livraison')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  id="ville_livraison"
                  label="Ville"
                  icon={MapPin}
                  required
                  autoComplete="address-level2"
                  placeholder="Antananarivo"
                  error={errors.ville_livraison}
                  value={formData.ville_livraison}
                  onChange={set('ville_livraison')}
                />
                <Input
                  id="code_postal_livraison"
                  label="Code postal"
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="101"
                  error={errors.code_postal_livraison}
                  value={formData.code_postal_livraison}
                  onChange={set('code_postal_livraison')}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="pays_livraison" className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Pays<span className="text-red-600 ml-0.5" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="pays_livraison"
                    value={formData.pays_livraison}
                    onChange={set('pays_livraison')}
                    autoComplete="country-name"
                    className="block w-full h-12 px-3.5 bg-white text-base text-gray-950 border border-gray-300 hover:border-gray-400 outline-none focus:border-gray-950 focus:ring-2 focus:ring-emerald-600/25 cursor-pointer"
                  >
                    <option value="Madagascar">Madagascar</option>
                    <option value="France">France</option>
                    <option value="Maurice">Maurice</option>
                    <option value="Réunion">Réunion</option>
                  </select>
                </div>
                <Input
                  id="telephone_livraison"
                  type="tel"
                  label="Téléphone"
                  icon={Phone}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="034 12 345 67"
                  hint="Le vendeur vous appelle pour organiser la livraison."
                  error={errors.telephone_livraison}
                  value={formData.telephone_livraison}
                  onChange={set('telephone_livraison')}
                />
              </div>
              <Textarea
                id="note_client"
                label="Instructions pour le vendeur"
                rows={3}
                placeholder="Point de repère, horaires de disponibilité…"
                error={errors.note_client}
                value={formData.note_client}
                onChange={set('note_client')}
              />
            </fieldset>

            <div className="flex gap-3 border-l-4 border-gray-950 bg-gray-50 p-4 text-sm text-gray-700">
              <Truck className="w-5 h-5 shrink-0 text-gray-950" aria-hidden="true" />
              <p>
                <span className="font-semibold text-gray-950">Frais de livraison : </span>
                fixés par le vendeur selon votre adresse. Il vous contacte pour les confirmer avant l’expédition.
              </p>
            </div>

            <div className="space-y-3">
              <SubmitButton loading={loading} loadingText="Envoi de la commande…" icon={Check}>
                Confirmer la commande · {formatPrix(sousTotal)}
              </SubmitButton>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="w-4 h-4 shrink-0" aria-hidden="true" />
                Aucun paiement maintenant : vous réglez le vendeur après confirmation (Mobile Money, virement ou espèces).
              </p>
            </div>
          </form>

          {/* Récapitulatif */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-28 border border-gray-200" aria-labelledby="recap-title">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 id="recap-title" className="font-display text-lg font-bold text-gray-950">
                Votre commande
              </h2>
              <span className="text-sm text-gray-600">
                {nbArticles} article{nbArticles > 1 ? 's' : ''}
              </span>
            </div>

            <ul className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {cart.map((item) => {
                const product = item.produit || item;
                const quantity = item.quantite || item.quantity;
                const total = item.prix_total ?? (product.prix_final || product.prix) * quantity;
                return (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-14 h-14 bg-gray-100 shrink-0 overflow-hidden">
                      {product.image_principale_id ? (
                        <BlobImage imageId={product.image_principale_id} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-300" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-950 truncate">{product.nom}</p>
                      <p className="text-xs text-gray-600">Quantité : {quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-950 whitespace-nowrap">{formatPrix(total)}</p>
                  </li>
                );
              })}
            </ul>

            <dl className="px-5 py-4 space-y-2 border-t border-gray-200 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Sous-total</dt>
                <dd className="font-medium text-gray-950">{formatPrix(sousTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Livraison</dt>
                <dd className="font-medium text-gray-950">Fixée par le vendeur</dd>
              </div>
              <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-gray-200">
                <dt className="font-display font-bold text-gray-950">Total articles</dt>
                <dd className="font-display text-2xl font-extrabold text-gray-950">{formatPrix(sousTotal)}</dd>
              </div>
            </dl>

            {user?.client?.adresse_livraison && (
              <p className="flex items-start gap-2 px-5 pb-4 text-xs text-gray-500">
                <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
                Adresse préremplie depuis votre profil.
              </p>
            )}
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
