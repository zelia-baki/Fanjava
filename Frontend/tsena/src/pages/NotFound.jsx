import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <p className="font-display text-7xl sm:text-9xl font-extrabold tracking-tight text-gray-950">404</p>
        <h1 className="mt-4 font-display text-2xl sm:text-3xl font-extrabold text-gray-950">Cette page n'existe pas.</h1>
        <p className="mt-2 max-w-xl text-gray-600">
          Le lien est peut-être erroné, ou le produit a été retiré par son vendeur.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-gray-950 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            Retour à la boutique
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          <Link
            to="/?en_promotion=true"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 border-2 border-gray-950 text-gray-950 font-semibold hover:bg-gray-950 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
            Voir les promotions
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}
