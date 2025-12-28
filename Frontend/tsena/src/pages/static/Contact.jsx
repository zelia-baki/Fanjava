import MainLayout from '@/layouts/MainLayout';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import PageWrapper from '@/components/PageWrapper';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
  return (
    <MainLayout>
      <BackgroundWrapper>
        <PageWrapper title="Contactez-nous" icon={MessageCircle}>

          <p className="text-lg text-gray-800">
            Une question ou un besoin d’assistance ?  
            Notre équipe FanJava est là pour vous aider.
          </p>

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
      </BackgroundWrapper>
    </MainLayout>
  );
}

function InfoCard({ icon: Icon, title, value, href, full }) {
  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      href={href}
      className={`flex items-start gap-4 p-6 rounded-xl border border-gray-200 bg-white/80 hover:border-blue-500 hover:shadow-lg transition ${
        full ? 'sm:col-span-2' : ''
      }`}
    >
      <Icon className="w-6 h-6 text-blue-600 mt-1" />
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-gray-700">{value}</p>
      </div>
    </Wrapper>
  );
}
