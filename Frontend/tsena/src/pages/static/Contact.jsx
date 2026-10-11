import MainLayout from '@/layouts/MainLayout';
import PageWrapper from '@/components/PageWrapper';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <MainLayout>
        <PageWrapper
          title="Contactez-nous"
          icon={MessageCircle}
          kicker="Service client"
          intro="Une question ou un besoin d’assistance ? Notre équipe FanJava est là pour vous aider."
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <InfoCard
              icon={Mail}
              title="Email"
              value="contact@fanjava.mg"
              href="mailto:contact@fanjava.mg"
            />

            <InfoCard
              icon={Phone}
              title="Téléphone"
              value="+261 XX XX XXX XX"
            />

            <InfoCard
              icon={MapPin}
              title="Adresse"
              value="Antananarivo, Madagascar"
              full
            />
          </div>

        </PageWrapper>
    </MainLayout>
  );
}

function InfoCard({ icon: Icon, title, value, href, full }) {
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      href={href}
      className={`flex items-start gap-4 p-6 border-2 border-gray-200 transition-colors ${
        href ? 'hover:border-gray-950' : ''
      } ${full ? 'sm:col-span-2' : ''}`}
    >
      <span className="w-11 h-11 shrink-0 flex items-center justify-center bg-emerald-50 text-emerald-700">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</p>
        <p className="mt-0.5 text-lg font-semibold text-gray-950">{value}</p>
      </div>
    </Wrapper>
  );
}
