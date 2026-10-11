export default function InfoSection({ icon: Icon, title, children }) {
  return (
    <section className="border-t-2 border-gray-950 pt-5">
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <span className="w-10 h-10 shrink-0 flex items-center justify-center bg-emerald-50 text-emerald-700">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
        )}
        <h2 className="font-display text-lg sm:text-xl font-bold text-gray-950">{title}</h2>
      </div>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}
