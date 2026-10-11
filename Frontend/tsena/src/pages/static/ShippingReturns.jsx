import MainLayout from '@/layouts/MainLayout';
import PageWrapper from '@/components/PageWrapper';
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
      <PageWrapper
        title="Livraison & retours"
        intro="Informations concernant l’expédition de vos commandes, les retours et les remboursements."
      >
          {/* Shipping */}
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-950 mb-6">
              Livraison
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
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
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-gray-950 mb-6">
              Retours & remboursements
            </h2>

            <div className="grid gap-8 md:grid-cols-2">
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
      </PageWrapper>
    </MainLayout>
  );
}
