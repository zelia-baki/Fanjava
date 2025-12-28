import MainLayout from '@/layouts/MainLayout';
import InfoSection from '@/components/ui/InfoSection';
import { FileText, UserCheck, Gavel } from 'lucide-react';

export default function Terms() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Conditions générales
          </h1>

          <div className="grid gap-6">
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
        </div>
      </div>
    </MainLayout>
  );
}
