import { Link } from 'react-router-dom';
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';

/*
 * Briques communes aux tableaux de bord (client, vendeur, admin) :
 * fond blanc, bord fin, une seule couleur d'accent porteuse de sens.
 */

const TONS = {
  neutral: 'bg-gray-100 text-gray-900',
  emerald: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
};

export function DashboardHeader({ kicker, title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        {kicker && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 mb-2">{kicker}</p>}
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-950">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Évolution sur un mois. N'affiche rien sans base de comparaison (null). */
export function Growth({ value }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <p className={`mt-3 flex items-center gap-1 text-sm font-medium ${up ? 'text-emerald-700' : 'text-red-700'}`}>
      <Icon className="w-4 h-4" aria-hidden="true" />
      {up ? '+' : ''}
      {value}% vs mois dernier
    </p>
  );
}

export function StatCard({ label, value, icon: Icon, tone = 'neutral', children, footer }) {
  return (
    <div className="bg-white border border-gray-200 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-1 font-display text-lg min-[400px]:text-xl sm:text-3xl font-extrabold text-gray-950 tabular-nums whitespace-nowrap">{value}</p>
        </div>
        {Icon && (
          <span className={`hidden sm:flex w-11 h-11 shrink-0 items-center justify-center ${TONS[tone]}`} aria-hidden="true">
            <Icon className="w-5 h-5" />
          </span>
        )}
      </div>
      {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
      {footer}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`text-xs font-semibold px-2 py-1 ${TONS[tone]}`}>{children}</span>;
}

export function ActionTile({ to, icon, title, text }) {
  const Icon = icon;
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 p-4 border-2 border-gray-200 hover:border-gray-950 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
    >
      <span className="w-11 h-11 shrink-0 flex items-center justify-center bg-gray-100 text-gray-900 group-hover:bg-gray-950 group-hover:text-white transition-colors" aria-hidden="true">
        <Icon className="w-5 h-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-semibold text-gray-950">{title}</span>
        <span className="block text-sm text-gray-600">{text}</span>
      </span>
      <ChevronRight className="w-5 h-5 shrink-0 text-gray-400 group-hover:text-gray-950 group-hover:translate-x-0.5 transition" aria-hidden="true" />
    </Link>
  );
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`bg-white border border-gray-200 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="font-display text-lg font-bold text-gray-950">{title}</h2>
          {action && <div className="shrink-0 whitespace-nowrap">{action}</div>}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
