import MainLayout from '@/layouts/MainLayout';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import PageWrapper from '@/components/PageWrapper';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: 'Comment créer un compte ?',
    a: 'Vous pouvez créer un compte client ou entreprise depuis la page inscription.'
  },
  {
    q: 'Les paiements sont-ils sécurisés ?',
    a: 'Oui, toutes les transactions sont sécurisées.'
  },
];

export default function FAQ() {
  return (
    <MainLayout>
      <BackgroundWrapper>
        <PageWrapper title="FAQ" icon={HelpCircle}>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <Accordion key={i} {...f} />
            ))}
          </div>
        </PageWrapper>
      </BackgroundWrapper>
    </MainLayout>
  );
}

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-xl overflow-hidden bg-white/80">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-5 hover:bg-blue-50 transition"
      >
        <span className="font-semibold text-left">{q}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden px-5 pb-5 text-gray-600">
          {a}
        </div>
      </div>
    </div>
  );
}
