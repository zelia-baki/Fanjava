import { Loader2 } from 'lucide-react';

/** Affiché pendant le téléchargement du code d'une page chargée à la demande */
export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Chargement">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
}
