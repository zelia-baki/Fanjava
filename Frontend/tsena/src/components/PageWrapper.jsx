/**
 * Gabarit des pages d'information (CGU, contact, FAQ…) : bandeau noir avec
 * le titre, puis contenu sur fond blanc.
 */
export default function PageWrapper({ title, icon: Icon, intro, kicker = 'FanJava.mg', children }) {
  return (
    <>
      <section className="bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
            {kicker}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold tracking-tight">{title}</h1>
          {intro && <p className="mt-4 max-w-2xl text-base sm:text-lg text-gray-300">{intro}</p>}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 text-gray-700">{children}</div>
    </>
  );
}
