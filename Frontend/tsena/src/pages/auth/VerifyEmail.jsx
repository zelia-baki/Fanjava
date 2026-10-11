import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Loader2, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthHeading } from '@/components/auth/AuthLayout';
import { FormAlert } from '@/components/ui/Form';

const bouton =
  'w-full h-12 flex items-center justify-center gap-2 bg-gray-950 hover:bg-emerald-700 text-white font-semibold transition-colors';

export default function VerifyEmail() {
  const { uid, token } = useParams();
  const [state, setState] = useState('loading'); // loading | success | error
  const dejaAppele = useRef(false); // le jeton ne sert qu'une fois (StrictMode appelle deux fois les effets)

  useEffect(() => {
    if (dejaAppele.current) return;
    dejaAppele.current = true;

    authService
      .verifyEmail(uid, token)
      .then(() => setState('success'))
      .catch(() => setState('error'));
  }, [uid, token]);

  return (
    <AuthLayout>
      <AuthHeading title="Confirmation de l'e-mail" />

      {state === 'loading' && (
        <p className="flex items-center gap-3 text-gray-700" role="status">
          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" aria-hidden="true" />
          Vérification de votre adresse e-mail…
        </p>
      )}
      {state === 'success' && (
        <div className="space-y-6">
          <FormAlert tone="success" title="Adresse e-mail confirmée">
            Merci ! Votre adresse e-mail est maintenant vérifiée.
          </FormAlert>
          <Link to="/" className={bouton}>
            Continuer mes achats
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      )}
      {state === 'error' && (
        <div className="space-y-6">
          <FormAlert title="Lien invalide ou expiré">
            Connectez-vous puis demandez un nouvel e-mail de confirmation depuis « Modifier mon profil ».
          </FormAlert>
          <Link to="/login" className={bouton}>
            Se connecter
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}
