import MainLayout from '@/layouts/MainLayout';
import PageWrapper from '@/components/PageWrapper';
import InfoSection from '@/components/ui/InfoSection';
import { FileText, UserCheck, Gavel } from 'lucide-react';

export default function Terms() {
  return (
    <MainLayout>
      <PageWrapper title="Conditions générales" intro="Les règles d'utilisation de la marketplace FanJava.mg.">
        <div className="grid gap-8">
            <InfoSection icon={FileText} title="Utilisation du site">
              <p>
                L’utilisation du site implique l’acceptation des présentes
                conditions.
              </p>
            </InfoSection>

            <InfoSection icon={UserCheck} title="Responsabilités">
              <p>
                L’utilisateur s’engage à fournir des informations exactes.
              </p>
            </InfoSection>

            <InfoSection icon={Gavel} title="Droit applicable">
              <p>
                Les présentes conditions sont régies par le droit en vigueur.
              </p>
            </InfoSection>
        </div>
      </PageWrapper>
    </MainLayout>
  );
}
