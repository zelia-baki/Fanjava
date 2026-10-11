/* eslint-disable react-refresh/only-export-components */
import { CheckCircle2, Clock, Package, PackageCheck, RotateCcw, Truck, XCircle } from 'lucide-react';

/*
 * Statuts de commande : libellé, couleur et étape du suivi, au même endroit
 * pour toutes les pages client (liste, tableau de bord, détail).
 */
export const STATUTS = {
  pending: { label: 'En attente du vendeur', court: 'En attente', icon: Clock, className: 'bg-orange-50 text-orange-800', etape: 0 },
  confirmed: { label: 'Confirmée', court: 'Confirmée', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-800', etape: 1 },
  processing: { label: 'En préparation', court: 'Préparation', icon: Package, className: 'bg-emerald-50 text-emerald-800', etape: 2 },
  shipped: { label: 'Expédiée', court: 'Expédiée', icon: Truck, className: 'bg-emerald-50 text-emerald-800', etape: 3 },
  delivered: { label: 'Livrée', court: 'Livrée', icon: PackageCheck, className: 'bg-gray-950 text-white', etape: 4 },
  cancelled: { label: 'Annulée', court: 'Annulée', icon: XCircle, className: 'bg-red-50 text-red-800', etape: -1 },
  refunded: { label: 'Remboursée', court: 'Remboursée', icon: RotateCcw, className: 'bg-gray-100 text-gray-800', etape: -1 },
};

export const STATUTS_EN_COURS = ['pending', 'confirmed', 'processing', 'shipped'];
// Identique à Commande.STATUTS_ANNULABLES_PAR_CLIENT côté backend
export const STATUTS_ANNULABLES = ['pending', 'confirmed'];

const ETAPES = ['Envoyée', 'Confirmée', 'Préparation', 'Expédiée', 'Livrée'];

export function OrderStatusBadge({ status }) {
  const statut = STATUTS[status] || STATUTS.pending;
  const Icon = statut.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${statut.className}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {statut.label}
    </span>
  );
}

/** Barre d'avancement en 5 étapes (rien pour une commande annulée/remboursée). */
export function OrderProgress({ status, compact = false, dark = false }) {
  const etape = STATUTS[status]?.etape ?? 0;
  if (etape < 0) return null;
  return (
    <div>
      <div
        className="flex gap-1"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={ETAPES.length}
        aria-valuenow={etape + 1}
        aria-valuetext={`Étape ${etape + 1} sur ${ETAPES.length} : ${ETAPES[etape]}`}
      >
        {ETAPES.map((nom, i) => (
          <span key={nom} className={`h-1.5 flex-1 ${i <= etape ? (dark ? 'bg-emerald-400' : 'bg-emerald-600') : dark ? 'bg-white/15' : 'bg-gray-200'}`} />
        ))}
      </div>
      {!compact && (
        <p className={`mt-2 sm:hidden text-xs ${dark ? 'text-gray-300' : 'text-gray-600'}`} aria-hidden="true">
          Étape {etape + 1}/{ETAPES.length} : <span className={`font-semibold ${dark ? 'text-white' : 'text-gray-950'}`}>{ETAPES[etape]}</span>
        </p>
      )}
      {!compact && (
        <ol className="mt-2 hidden sm:grid grid-cols-5 text-xs" aria-hidden="true">
          {ETAPES.map((nom, i) => (
            <li
              key={nom}
              className={
                i === etape
                  ? `font-semibold ${dark ? 'text-white' : 'text-gray-950'}`
                  : i < etape
                    ? dark ? 'text-gray-300' : 'text-gray-600'
                    : dark ? 'text-gray-500' : 'text-gray-400'
              }
            >
              {nom}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function formatDateCommande(date, avecHeure = false) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(avecHeure ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}
