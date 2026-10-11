import { Link } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, ShieldCheck, Truck, Store, Users, Wallet } from 'lucide-react';

const PANNEAUX = {
  shop: {
    kicker: 'Marketplace malgache',
    title: (
      <>
        Tout Madagascar,
        <br />
        <span className="text-emerald-400">en un panier.</span>
      </>
    ),
    points: [
      { icon: Truck, text: 'Livraison partout à Madagascar' },
      { icon: ShieldCheck, text: 'Paiement sécurisé et suivi de commande' },
      { icon: BadgeCheck, text: 'Des vendeurs vérifiés par notre équipe' },
    ],
  },
  seller: {
    kicker: 'Espace vendeur',
    title: (
      <>
        Vendez à tout
        <br />
        <span className="text-orange-400">Madagascar.</span>
      </>
    ),
    points: [
      { icon: Users, text: 'Des milliers de clients qui cherchent vos produits' },
      { icon: Store, text: 'Votre boutique en ligne, sans frais de création' },
      { icon: Wallet, text: 'Commandes, paiements et avis réunis au même endroit' },
    ],
  },
};

function Logo({ dark = false }) {
  return (
    <Link to="/" className="inline-flex items-baseline font-display" aria-label="FanJava.mg, accueil">
      <span className={`text-2xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-gray-950'}`}>FANJAVA</span>
      <span className={`text-base font-bold ${dark ? 'text-emerald-400' : 'text-emerald-600'}`}>.mg</span>
    </Link>
  );
}

/**
 * Mise en page des écrans d'authentification : panneau de marque à gauche (desktop),
 * formulaire à droite, aligné à gauche dans sa colonne. Sur mobile, barre compacte
 * puis formulaire pleine largeur.
 *
 * `variant` : 'shop' (clients) ou 'seller' (vendeurs). `wide` élargit la colonne
 * du formulaire pour les inscriptions.
 */
export default function AuthLayout({ variant = 'shop', wide = false, children }) {
  const panneau = PANNEAUX[variant];
  const accent = variant === 'seller' ? 'bg-orange-500' : 'bg-emerald-500';

  return (
    <div className="min-h-dvh bg-white lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Panneau de marque (desktop) */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-dvh flex-col justify-between bg-gray-950 text-white p-12 xl:p-16 overflow-hidden relative">
        <Logo dark />

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-5">{panneau.kicker}</p>
          <p className="font-display text-4xl xl:text-5xl font-extrabold leading-[1.05] tracking-tight">{panneau.title}</p>
          <ul className="mt-10 space-y-4">
            {panneau.points.map((point) => (
              <li key={point.text} className="flex items-center gap-4 text-gray-200">
                <span className="w-10 h-10 shrink-0 flex items-center justify-center border border-white/15">
                  <point.icon className="w-5 h-5" aria-hidden="true" />
                </span>
                {point.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-gray-500">© {new Date().getFullYear()} FanJava.mg</p>

        {/* Composition géométrique décorative */}
        <div className="absolute -right-10 bottom-16 grid grid-cols-3 gap-2 opacity-90" aria-hidden="true">
          <span className={`w-20 h-20 ${accent}`} />
          <span className="w-20 h-20 border-2 border-white/20" />
          <span className="w-20 h-20" />
          <span className="w-20 h-20" />
          <span className="w-20 h-20 bg-white/10" />
          <span className={`w-20 h-20 ${variant === 'seller' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
        </div>
      </aside>

      {/* Colonne formulaire */}
      <div className="flex flex-col min-h-dvh">
        <div className={`h-1.5 ${accent} lg:hidden`} aria-hidden="true" />
        <header className="flex items-center justify-between gap-4 px-5 sm:px-10 lg:px-16 h-16 lg:h-20 border-b border-gray-100 lg:border-0">
          <span className="lg:invisible">
            <Logo />
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-gray-700 hover:text-gray-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>
              Retour <span className="hidden sm:inline">à la boutique</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 flex lg:items-center px-5 sm:px-10 lg:px-16 py-8 sm:py-12">
          <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>{children}</div>
        </main>
      </div>
    </div>
  );
}

/** En-tête de formulaire : titre fort et sous-titre. */
export function AuthHeading({ title, children }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950">{title}</h1>
      {children && <div className="mt-2 text-base text-gray-600">{children}</div>}
    </div>
  );
}
