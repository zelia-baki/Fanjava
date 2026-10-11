import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthHeading } from '@/components/auth/AuthLayout';
import { Input, FormAlert, SubmitButton } from '@/components/ui/Form';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.requestPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Impossible d'envoyer la demande. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Mot de passe oublié">
        Indiquez l'adresse e-mail de votre compte : nous vous enverrons un lien pour en choisir un nouveau.
      </AuthHeading>

      {sent ? (
        <div className="space-y-6">
          <FormAlert tone="success" title="Vérifiez votre boîte mail">
            Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation vient d'être envoyé.
            Il est valable 3 jours. Pensez à regarder dans les indésirables.
          </FormAlert>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm font-semibold text-gray-700 hover:text-gray-950 underline underline-offset-4 cursor-pointer"
          >
            Utiliser une autre adresse
          </button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && <FormAlert>{error}</FormAlert>}
          <Input
            id="email"
            type="email"
            label="Adresse e-mail"
            icon={Mail}
            required
            autoComplete="email"
            autoFocus
            placeholder="vous@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <SubmitButton loading={loading} loadingText="Envoi…" icon={ArrowRight}>
            Envoyer le lien
          </SubmitButton>
        </form>
      )}

      <Link to="/login" className="mt-8 inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-gray-700 hover:text-gray-950">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Retour à la connexion
      </Link>
    </AuthLayout>
  );
}
