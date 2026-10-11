import MainLayout from '@/layouts/MainLayout';
import PageWrapper from '@/components/PageWrapper';
import InfoSection from '@/components/ui/InfoSection';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export default function Privacy() {
  return (
    <MainLayout>
      <PageWrapper title="Politique de confidentialité" intro="Comment nous collectons, utilisons et protégeons vos données.">
        <div className="grid gap-8">
            <InfoSection icon={ShieldCheck} title="Protection des données">
              <p>
                Nous respectons votre vie privée et protégeons vos données
                personnelles conformément aux réglementations en vigueur.
              </p>
            </InfoSection>

            <InfoSection icon={Database} title="Données collectées">
              <p>
                Les données collectées sont utilisées uniquement pour le
                traitement des commandes et l’amélioration de nos services.
              </p>
            </InfoSection>

            <InfoSection icon={Lock} title="Sécurité">
              <p>
                Toutes les informations sont sécurisées et ne sont jamais
                partagées sans votre consentement.
              </p>
            </InfoSection>
        </div>
      </PageWrapper>
    </MainLayout>
  );
}
