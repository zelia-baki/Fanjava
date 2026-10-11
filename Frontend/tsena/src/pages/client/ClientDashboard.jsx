import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import PageLoader from '@/components/ui/PageLoader';
import BlobImage from '@/components/ui/BlobImage';
import { FormAlert } from '@/components/ui/Form';
import { DashboardHeader, StatCard, ActionTile, Panel } from '@/components/dashboard/DashboardUI';
import { OrderStatusBadge, OrderProgress, STATUTS_EN_COURS, formatDateCommande } from '@/components/orders/OrderStatus';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrix } from '@/utils/format';
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  User,
  Wallet,
} from 'lucide-react';

const NON_DEPENSE = ['cancelled', 'refunded'];

export default function ClientDashboard() {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders();
      const liste = data.results || data;
      setOrders(liste);
      setTotal(data.count ?? liste.length);
    } catch {
      setError('Impossible de charger vos commandes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <PageLoader />
      </MainLayout>
    );
  }

  const enCours = orders.filter((o) => STATUTS_EN_COURS.includes(o.status));
  const livrees = orders.filter((o) => o.status === 'delivered').length;
  const depense = orders
    .filter((o) => !NON_DEPENSE.includes(o.status))
    .reduce((sum, o) => sum + parseFloat(o.montant_final || 0), 0);
  const aSuivre = enCours[0]; // la plus récente (l'API trie du plus récent au plus ancien)
  const recentes = orders.slice(0, 5);
  const nbPanier = getItemCount();
  const adresseIncomplete = !user?.client?.adresse_livraison || !user?.phone;
  const nom = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <DashboardHeader
          kicker="Mon compte"
          title={`Bonjour ${user?.first_name || user?.username || ''}`}
          subtitle="Vos commandes, votre panier et votre profil au même endroit."
          action={
            nbPanier > 0 && (
              <Link
                to="/cart"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 bg-orange-500 hover:bg-orange-400 text-gray-950 font-semibold transition-colors"
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                Finaliser mon panier ({nbPanier})
              </Link>
            )
          }
        />

        {error && (
          <div className="mb-6">
            <FormAlert title={error}>
              <button type="button" onClick={fetchData} className="font-semibold underline underline-offset-2 cursor-pointer">
                Réessayer
              </button>
            </FormAlert>
          </div>
        )}

        {/* Commande à suivre */}
        {aSuivre && (
          <section className="mb-6 bg-gray-950 text-white p-5 sm:p-6" aria-labelledby="suivi-title">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Commande en cours</p>
                <h2 id="suivi-title" className="mt-1 font-display text-xl sm:text-2xl font-extrabold">
                  {aSuivre.numero_commande}
                </h2>
                <p className="text-sm text-gray-400">
                  {formatDateCommande(aSuivre.created_at)}
                  {aSuivre.entreprise_nom && <> · {aSuivre.entreprise_nom}</>} · {formatPrix(aSuivre.montant_final)}
                </p>
              </div>
              <Link
                to={`/profile/orders/${aSuivre.id}`}
                className="inline-flex items-center gap-2 h-11 px-4 bg-white text-gray-950 text-sm font-semibold hover:bg-emerald-400 transition-colors"
              >
                Suivre
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <OrderProgress status={aSuivre.status} dark />
            {enCours.length > 1 && (
              <p className="mt-4 text-sm text-gray-400">
                + {enCours.length - 1} autre{enCours.length > 2 ? 's' : ''} commande{enCours.length > 2 ? 's' : ''} en cours ·{' '}
                <Link to="/profile/orders" className="text-white underline underline-offset-2">
                  tout voir
                </Link>
              </p>
            )}
          </section>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Commandes" value={total} icon={ShoppingBag} />
          <StatCard label="En cours" value={enCours.length} icon={Clock} tone={enCours.length > 0 ? 'orange' : 'neutral'} />
          <StatCard label="Livrées" value={livrees} icon={PackageCheck} tone="emerald" />
          <StatCard label="Total dépensé" value={formatPrix(depense)} icon={Wallet} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Panel
            title="Commandes récentes"
            className="lg:col-span-2"
            action={
              orders.length > 0 && (
                <Link to="/profile/orders" className="inline-flex items-center gap-1 min-h-11 text-sm font-semibold text-gray-950 hover:underline underline-offset-4">
                  Tout voir
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )
            }
          >
            {recentes.length === 0 ? (
              <div className="py-10 text-center">
                <Package className="mx-auto w-10 h-10 text-gray-300" aria-hidden="true" />
                <p className="mt-3 font-semibold text-gray-950">Aucune commande pour l'instant</p>
                <p className="text-sm text-gray-600">Vos achats et leur suivi apparaîtront ici.</p>
                <Link
                  to="/"
                  className="mt-6 inline-flex items-center justify-center h-11 px-5 bg-gray-950 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                >
                  Découvrir les produits
                </Link>
              </div>
            ) : (
              <ul className="-my-3 divide-y divide-gray-100">
                {recentes.map((order) => {
                  const premiere = order.lignes?.[0];
                  const nbLignes = order.lignes?.length || 0;
                  return (
                    <li key={order.id}>
                      <Link
                        to={`/profile/orders/${order.id}`}
                        className="group flex items-center gap-3 sm:gap-4 py-3 -mx-2 px-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-12 h-12 shrink-0 bg-gray-100 overflow-hidden">
                          {premiere?.image_principale_id ? (
                            <BlobImage imageId={premiere.image_principale_id} alt="" lazy className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-300" aria-hidden="true" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-950 truncate">
                            {premiere?.nom_produit || order.numero_commande}
                            {nbLignes > 1 && <span className="font-normal text-gray-600"> + {nbLignes - 1}</span>}
                          </p>
                          <p className="text-xs text-gray-600">
                            {order.numero_commande} · {formatDateCommande(order.created_at)}
                          </p>
                        </div>
                        <div className="hidden sm:block">
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm font-bold text-gray-950 whitespace-nowrap">{formatPrix(order.montant_final)}</p>
                        <ChevronRight className="w-4 h-4 shrink-0 text-gray-400 group-hover:text-gray-950" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <div className="space-y-6">
            <Panel
              title="Mon profil"
              action={
                <Link to="/profile/edit" className="inline-flex items-center min-h-11 text-sm font-semibold text-gray-950 hover:underline underline-offset-4">
                  Modifier
                </Link>
              }
            >
              <dl className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="sr-only">Nom</dt>
                    <dd className="font-medium text-gray-950 truncate">{nom}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="sr-only">E-mail</dt>
                    <dd className="text-gray-700 truncate">{user?.email}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500" aria-hidden="true" />
                  <div className="min-w-0">
                    <dt className="sr-only">Adresse de livraison</dt>
                    <dd className="text-gray-700">
                      {user?.client?.adresse_livraison
                        ? [user.client.adresse_livraison, user.client.ville].filter(Boolean).join(', ')
                        : 'Aucune adresse enregistrée'}
                    </dd>
                  </div>
                </div>
              </dl>
              {adresseIncomplete && (
                <Link
                  to="/profile/edit"
                  className="mt-4 flex items-start gap-3 p-3 border-l-4 border-orange-500 bg-orange-50 text-sm text-gray-800 hover:bg-orange-100 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                  Ajoutez votre adresse et votre téléphone : ils seront préremplis à chaque commande.
                </Link>
              )}
            </Panel>

            <Panel title="Raccourcis">
              <div className="space-y-3">
                <ActionTile to="/profile/orders" icon={Package} title="Mes commandes" text="Suivi et historique" />
                <ActionTile to="/myreviews" icon={Star} title="Mes avis" text="Avis sur vos achats" />
                <ActionTile to="/cart" icon={ShoppingCart} title="Mon panier" text={nbPanier ? `${nbPanier} article${nbPanier > 1 ? 's' : ''}` : 'Vide pour le moment'} />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
