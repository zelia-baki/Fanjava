import MainLayout from '@/layouts/MainLayout';
import PageWrapper from '@/components/PageWrapper';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

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
        <PageWrapper
          title="Questions fréquentes"
          icon={HelpCircle}
          kicker="Aide"
          intro="Les réponses aux questions les plus courantes sur FanJava.mg."
        >
          <div className="border-t-2 border-gray-950">
            {faqs.map((f) => (
              <Accordion key={f.q} {...f} />
            ))}
          </div>
          <p className="text-gray-700">
            Vous ne trouvez pas votre réponse ?{' '}
            <Link to="/contact" className="font-semibold text-gray-950 underline underline-offset-4 decoration-emerald-500 decoration-2">
              Contactez-nous
            </Link>
          </p>
        </PageWrapper>
    </MainLayout>
  );
}

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="border-b border-gray-200">
      <h2>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={id}
          className="w-full min-h-14 flex justify-between items-center gap-4 py-5 text-left font-display text-lg font-bold text-gray-950 hover:text-emerald-700 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          {q}
          <ChevronDown
            className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h2>
      <div
        id={id}
        className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-gray-700 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}
