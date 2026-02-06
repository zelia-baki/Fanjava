import MainLayout from '@/layouts/MainLayout';
import InfoSection from '@/components/ui/InfoSection';
import {
  Truck,
  Clock,
  MapPin,
  RotateCcw,
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function ShippingReturns() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Livraison & Retours
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Informations concernant l’expédition de vos commandes,
              les retours et les remboursements.
            </p>
          </div>

          {/* Shipping */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              🚚 Livraison
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <InfoSection icon={Truck} title="Modes de livraison">
                <p>
                  Nous proposons plusieurs options de livraison adaptées à
                  votre localisation et à vos besoins.
                </p>
              </InfoSection>

              <InfoSection icon={Clock} title="Délais de livraison">
                <p>
                  Les délais varient entre <strong>2 et 7 jours ouvrables</strong>,
                  selon la destination et le transporteur.
                </p>
              </InfoSection>

              <InfoSection icon={MapPin} title="Zones desservies">
                <p>
                  Livraison nationale et internationale selon la disponibilité
                  des transporteurs.
                </p>
              </InfoSection>
            </div>
          </div>

          {/* Returns */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              🔄 Retours & Remboursements
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <InfoSection icon={RotateCcw} title="Conditions de retour">
                <p>
                  Vous disposez de <strong>14 jours</strong> après réception
                  pour effectuer un retour, sous réserve que le produit
                  soit dans son état d’origine.
                </p>
              </InfoSection>

              <InfoSection icon={CreditCard} title="Remboursements">
                <p>
                  Les remboursements sont effectués sous <strong>7 jours</strong>
                  après validation du retour.
                </p>
              </InfoSection>

              <InfoSection icon={AlertCircle} title="Exceptions">
                <p>
                  Certains produits personnalisés ou soldés peuvent ne pas
                  être éligibles au retour.
                </p>
              </InfoSection>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
