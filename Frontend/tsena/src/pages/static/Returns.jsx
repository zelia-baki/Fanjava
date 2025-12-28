import MainLayout from '@/layouts/MainLayout';
import InfoSection from '@/components/ui/InfoSection';
import { RotateCcw, CreditCard, AlertCircle } from 'lucide-react';

export default function Return() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Retours & Remboursements
          </h1>

          <div className="grid gap-6">
            <InfoSection icon={RotateCcw} title="Conditions de retour">
              <p>
                Les retours sont acceptés sous 14 jours après réception du
                produit.
              </p>
            </InfoSection>

            <InfoSection icon={CreditCard} title="Remboursement">
              <p>
                Les remboursements sont effectués sous 7 jours après validation
                du retour.
              </p>
            </InfoSection>

            <InfoSection icon={AlertCircle} title="Exceptions">
              <p>
                Certains produits ne sont pas éligibles au retour.
              </p>
            </InfoSection>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
