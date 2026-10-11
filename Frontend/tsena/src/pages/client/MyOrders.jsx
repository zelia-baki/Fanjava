import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageLoader from '@/components/ui/PageLoader';
import BlobImage from '@/components/ui/BlobImage';
import { FormAlert } from '@/components/ui/Form';
import { DashboardHeader } from '@/components/dashboard/DashboardUI';
import {
  OrderStatusBadge,
  OrderProgress,
  STATUTS_EN_COURS,
  STATUTS_ANNULABLES,
  formatDateCommande,
} from '@/components/orders/OrderStatus';
import { orderService } from '@/services/orderService';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { formatPrix } from '@/utils/format';
import { ChevronRight, Loader2, MapPin, Package, ShoppingBag, Star, Truck, XCircle } from 'lucide-react';

const FILTRES = [
  { id: 'all', label: 'Toutes', test: () => true },
  { id: 'active', label: 'En cours', test: (o) => STATUTS_EN_COURS.includes(o.status) },
  { id: 'delivered', label: 'Livrées', test: (o) => o.status === 'delivered' },
  { id: 'cancelled', label: 'Annulées', test: (o) => ['cancelled', 'refunded'].includes(o.status) },
];

function Vignette({ ligne }) {
  return (
    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-gray-100 overflow-hidden">
      {ligne.image_principale_id ? (
        <BlobImage imageId={ligne.image_principale_id} alt="" lazy className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="w-5 h-5 text-gray-300" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onCancel, cancelling }) {
  const lignes = order.lignes || [];
  const visibles = lignes.slice(0, 3);
  const reste = lignes.length - visibles.length;
  const annulable = order.peut_annuler ?? STATUTS_ANNULABLES.includes(order.status);
  const livree = order.status === 'delivered';

  return (
    <article className="border border-gray-200 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="min-w-0">
          <h2 className="font-display text-base sm:text-lg font-bold text-gray-950">
            <Link to={`/profile/orders/${order.id}`} className="hover:underline underline-offset-4">
              Commande {order.numero_commande}
            </Link>
          </h2>
          <p className="text-sm text-gray-600">
            {formatDateCommande(order.created_at)}
            {order.entreprise_nom && <> · {order.entreprise_nom}</>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <p className="font-display text-lg font-extrabold text-gray-950 whitespace-nowrap">{formatPrix(order.montant_final)}</p>
        </div>
      </header>

      <div className="px-4 sm:px-6 py-4 space-y-4">
        <OrderProgress status={order.status} />

        <ul className="space-y-3">
          {visibles.map((ligne) => (
            <li key={ligne.id} className="flex items-center gap-3">
              <Vignette ligne={ligne} />
              <div className="flex-1 min-w-0">
                {ligne.produit_slug ? (
                  <Link to={`/products/${ligne.produit_slug}`} className="block text-sm font-medium text-gray-950 truncate hover:underline underline-offset-4">
                    {ligne.nom_produit}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-gray-950 truncate">{ligne.nom_produit}</p>
                )}
                <p className="text-sm text-gray-600">
                  {ligne.quantite} × {formatPrix(ligne.prix_unitaire)}
                </p>
              </div>
              {livree && ligne.produit_slug && (
                <Link
                  to={`/products/${ligne.produit_slug}#avis`}
                  className="hidden sm:inline-flex items-center gap-1.5 min-h-11 px-3 text-sm font-semibold text-gray-950 border-2 border-gray-200 hover:border-gray-950 transition-colors"
                >
                  <Star className="w-4 h-4" aria-hidden="true" />
                  Donner mon avis
                </Link>
              )}
            </li>
          ))}
        </ul>
        {reste > 0 && (
          <p className="text-sm text-gray-600">
            + {reste} autre{reste > 1 ? 's' : ''} article{reste > 1 ? 's' : ''}
          </p>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
          <p className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
            {order.ville_livraison}
          </p>
          {order.numero_suivi && (
            <p className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 shrink-0" aria-hidden="true" />
              Suivi : <span className="font-semibold text-gray-950">{order.numero_suivi}</span>
            </p>
          )}
        </div>
      </div>

      <footer className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div>
          {annulable && (
            <button
              type="button"
              onClick={() => onCancel(order)}
              disabled={cancelling}
              className="inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-red-700 hover:text-red-800 disabled:opacity-50 cursor-pointer"
            >
              {cancelling ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <XCircle className="w-4 h-4" aria-hidden="true" />}
              Annuler la commande
            </button>
          )}
        </div>
        <Link
          to={`/profile/orders/${order.id}`}
          className="inline-flex items-center justify-center gap-1 h-11 px-5 bg-gray-950 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
        >
          Voir le détail
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </footer>
    </article>
  );
}

export default function MyOrders() {
  const toast = useToast();
  const confirm = useConfirm();
  const [orders, setOrders] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [filtre, setFiltre] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  const charger = async (page = 1) => {
    const data = await orderService.getOrders({ page });
    const liste = data.results || data;
    setOrders((prev) => (page === 1 ? liste : [...prev, ...liste]));
    setNextPage(data.next ? page + 1 : null);
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      await charger(1);
    } catch {
      setError('Impossible de charger vos commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const chargerPlus = async () => {
    setLoadingMore(true);
    try {
      await charger(nextPage);
    } catch {
      toast.error('Impossible de charger plus de commandes.');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCancel = async (order) => {
    const ok = await confirm(`La commande ${order.numero_commande} sera annulée et le vendeur prévenu.`, {
      title: 'Annuler cette commande ?',
      confirmLabel: 'Oui, annuler',
      cancelLabel: 'Garder la commande',
      danger: true,
    });
    if (!ok) return;
    setCancellingId(order.id);
    try {
      const updated = await orderService.cancelOrder(order.id);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
      toast.success('Commande annulée.');
    } catch (err) {
      toast.error(err.response?.data?.error || "Impossible d'annuler la commande.");
    } finally {
      setCancellingId(null);
    }
  };

  const compteurs = useMemo(
    () => Object.fromEntries(FILTRES.map((f) => [f.id, orders.filter(f.test).length])),
    [orders]
  );
  const affichees = orders.filter(FILTRES.find((f) => f.id === filtre).test);

  if (loading) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <DashboardHeader kicker="Mon compte" title="Mes commandes" subtitle="Suivez vos commandes et retrouvez vos achats." />

        {error ? (
          <FormAlert title={error}>
            <button type="button" onClick={fetchOrders} className="font-semibold underline underline-offset-2 cursor-pointer">
              Réessayer
            </button>
          </FormAlert>
        ) : orders.length === 0 ? (
          <div className="border border-gray-200 px-6 py-16 text-center">
            <ShoppingBag className="mx-auto w-12 h-12 text-gray-300" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-extrabold text-gray-950">Pas encore de commande</h2>
            <p className="mt-2 text-gray-600">Vos achats apparaîtront ici, avec leur suivi de livraison.</p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center h-12 px-6 bg-gray-950 hover:bg-emerald-700 text-white font-semibold transition-colors"
            >
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <>
            {/* Filtres */}
            <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar mb-6">
              <div role="tablist" aria-label="Filtrer les commandes" className="flex gap-2 min-w-max">
                {FILTRES.map((f) => {
                  const actif = filtre === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      role="tab"
                      aria-selected={actif}
                      onClick={() => setFiltre(f.id)}
                      className={`h-11 px-4 text-sm font-semibold border-2 transition-colors cursor-pointer ${
                        actif ? 'bg-gray-950 border-gray-950 text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-950'
                      }`}
                    >
                      {f.label}
                      <span className={`ml-2 tabular-nums ${actif ? 'text-gray-300' : 'text-gray-500'}`}>{compteurs[f.id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {affichees.length === 0 ? (
              <p className="border border-gray-200 px-6 py-10 text-center text-gray-600">Aucune commande dans cette catégorie.</p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {affichees.map((order) => (
                  <OrderCard key={order.id} order={order} onCancel={handleCancel} cancelling={cancellingId === order.id} />
                ))}
              </div>
            )}

            {nextPage && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={chargerPlus}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 h-12 px-6 border-2 border-gray-950 font-semibold text-gray-950 hover:bg-gray-950 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  Afficher plus de commandes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
