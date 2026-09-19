import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        {state === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto" />
            <p className="text-gray-600">Vérification de votre adresse e-mail...</p>
          </>
        )}
        {state === 'success' && (
          <>
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Adresse e-mail confirmée</h1>
            <p className="text-gray-600">Merci ! Votre adresse e-mail est maintenant vérifiée.</p>
            <Link
              to="/"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Retour à l'accueil
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <XCircle className="w-14 h-14 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900">Lien invalide ou expiré</h1>
            <p className="text-gray-600">
              Connectez-vous puis demandez un nouvel e-mail de confirmation depuis « Modifier mon profil ».
            </p>
            <Link
              to="/login"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Se connecter
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
