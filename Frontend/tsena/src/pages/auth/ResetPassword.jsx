import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Lock, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthHeading } from '@/components/auth/AuthLayout';
import { PasswordInput, FormAlert, SubmitButton } from '@/components/ui/Form';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (password.length < 8) {
      setErrors({ password: 'Le mot de passe doit contenir au moins 8 caractères.' });
      return;
    }
    if (password !== confirmation) {
      setErrors({ confirmation: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.new_password) {
        setErrors({ password: data.new_password.join(' ') });
      } else {
        setErrors({ general: data?.detail || 'Ce lien est invalide ou a expiré.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Nouveau mot de passe">Choisissez un nouveau mot de passe pour votre compte.</AuthHeading>

      {done ? (
        <div className="space-y-6">
          <FormAlert tone="success" title="Mot de passe modifié">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </FormAlert>
          <Link
            to="/login"
            className="w-full h-12 flex items-center justify-center gap-2 bg-gray-950 hover:bg-emerald-700 text-white font-semibold transition-colors"
          >
            Se connecter
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <FormAlert title={errors.general}>
              <Link to="/forgot-password" className="font-semibold underline underline-offset-2">
                Faire une nouvelle demande
              </Link>
            </FormAlert>
          )}
          <PasswordInput
            id="password"
            label="Nouveau mot de passe"
            icon={Lock}
            required
            autoComplete="new-password"
            autoFocus
            hint="8 caractères minimum."
            error={errors.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordInput
            id="confirmation"
            label="Confirmer le mot de passe"
            icon={Lock}
            required
            autoComplete="new-password"
            error={errors.confirmation}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
          <SubmitButton loading={loading} loadingText="Enregistrement…" icon={ArrowRight}>
            Modifier le mot de passe
          </SubmitButton>
        </form>
      )}
    </AuthLayout>
  );
}
