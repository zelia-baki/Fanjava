import { useLocation, Link, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { formatPrix } from '@/utils/format';
import { ArrowRight, Bell, Check, MapPin, Package, Phone, Truck, Wallet } from 'lucide-react';

const STATUTS = {
  pending: 'En attente du vendeur',
  confirmed: 'Confirmée',
  processing: 'En préparation',
};

// Étapes réelles du parcours : le vendeur confirme, fixe la livraison, puis expédie.
const SUITE = [
  { icon: Check, titre: 'Commande envoyée', texte: 'Le vendeur a reçu votre commande.', faite: true },
  { icon: Phone, titre: 'Confirmation par le vendeur', texte: 'Il vous contacte pour confirmer la commande et les frais de livraison.' },
  { icon: Wallet, titre: 'Paiement', texte: 'Vous réglez le vendeur : Mobile Money, virement ou espèces.' },
  { icon: Truck, titre: 'Livraison', texte: 'Vous suivez chaque étape depuis « Mes commandes ».' },
];

export default function OrderConfirmation() {
  const location = useLocation();
  const { orders } = location.state || {};

  if (!orders || orders.length === 0) {
    return <Navigate to="/profile/orders" replace />;
  }

  const plusieurs = orders.length > 1;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Succès */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-8 border-b-2 border-gray-950">
          <span className="w-14 h-14 shrink-0 flex items-center justify-center bg-emerald-700 text-white" aria-hidden="true">
            <Check className="w-8 h-8" strokeWidth={3} />
          </span>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950">
              Merci, votre commande est envoyée !
            </h1>
            <p className="mt-1 text-gray-600">
              {plusieurs
                ? `Vos articles viennent de ${orders.length} vendeurs : ${orders.length} commandes ont été créées.`
                : 'Le vendeur va vous contacter pour confirmer la livraison.'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
          {/* Commandes */}
          <div className="space-y-6">
            {orders.map((order) => {
              const frais = parseFloat(order.frais_livraison || 0);
              return (
                <article key={order.id} className="border border-gray-200">
                  <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-200">
                    <div>
                      <h2 className="font-display text-lg font-bold text-gray-950">Commande {order.numero_commande}</h2>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-orange-800">
                      {STATUTS[order.status] || order.status}
                    </span>
                  </header>

                  <ul className="divide-y divide-gray-100">
                    {order.lignes?.map((ligne) => (
                      <li key={ligne.id} className="flex items-center justify-between gap-4 px-5 py-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-950 text-sm truncate">{ligne.nom_produit}</p>
                          <p className="text-sm text-gray-600">
                            {ligne.quantite} × {formatPrix(ligne.prix_unitaire)}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-950 whitespace-nowrap">{formatPrix(ligne.prix_total)}</p>
                      </li>
                    ))}
                  </ul>

                  <div className="grid sm:grid-cols-2 gap-5 px-5 py-4 border-t border-gray-200 bg-gray-50 text-sm">
                    <div>
                      <p className="flex items-center gap-2 font-semibold text-gray-950 mb-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" /> Livraison
                      </p>
                      <p className="text-gray-700">{order.adresse_livraison}</p>
                      <p className="text-gray-700">
                        {order.ville_livraison} {order.code_postal_livraison}, {order.pays_livraison}
                      </p>
                      <p className="text-gray-700">{order.telephone_livraison}</p>
                    </div>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Articles</dt>
                        <dd className="font-medium text-gray-950">{formatPrix(order.montant_total)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Livraison</dt>
                        <dd className="font-medium text-gray-950">{frais > 0 ? formatPrix(frais) : 'À confirmer'}</dd>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 mt-1 border-t border-gray-200">
                        <dt className="font-semibold text-gray-950">Total</dt>
                        <dd className="font-display text-xl font-extrabold text-gray-950">
                          {formatPrix(order.montant_final)}
                          {frais === 0 && <span className="block text-xs font-normal text-gray-500 text-right">+ livraison</span>}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {order.note_client && (
                    <p className="px-5 py-3 border-t border-gray-200 text-sm text-gray-700">
                      <span className="font-semibold text-gray-950">Votre note : </span>
                      {order.note_client}
                    </p>
                  )}
                </article>
              );
            })}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/profile/orders"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-gray-950 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                <Package className="w-5 h-5" aria-hidden="true" />
                Suivre mes commandes
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 border-2 border-gray-950 text-gray-950 font-semibold hover:bg-gray-950 hover:text-white transition-colors"
              >
                Continuer mes achats
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Suite */}
          <aside className="border border-gray-200 p-5" aria-labelledby="suite-title">
            <h2 id="suite-title" className="font-display text-lg font-bold text-gray-950 mb-5">
              Et maintenant ?
            </h2>
            <ol className="space-y-5">
              {SUITE.map((etape) => (
                <li key={etape.titre} className="flex gap-3">
                  <span
                    className={`w-8 h-8 shrink-0 flex items-center justify-center ${
                      etape.faite ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                    aria-hidden="true"
                  >
                    <etape.icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-950">{etape.titre}</p>
                    <p className="text-sm text-gray-600">{etape.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 pt-4 border-t border-gray-200 flex gap-2 text-sm text-gray-600">
              <Bell className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              Chaque changement de statut apparaît dans vos notifications.
            </p>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}
