import MainLayout from '@/layouts/MainLayout';
import InfoSection from '@/components/ui/InfoSection';
import { ShieldCheck, Database, Lock } from 'lucide-react';

export default function Privacy() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Politique de confidentialité
          </h1>

          <div className="grid gap-6">
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
        </div>
      </div>
    </MainLayout>
  );
}
