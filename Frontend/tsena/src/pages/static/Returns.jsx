import MainLayout from '@/layouts/MainLayout';
import PageWrapper from '@/components/PageWrapper';
import InfoSection from '@/components/ui/InfoSection';
import { RotateCcw, CreditCard, AlertCircle } from 'lucide-react';

export default function Return() {
  return (
    <MainLayout>
      <PageWrapper title="Retours & Remboursements" intro="Vos droits et la marche à suivre pour retourner un article.">
        <div className="grid gap-8">
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
      </PageWrapper>
    </MainLayout>
  );
}
