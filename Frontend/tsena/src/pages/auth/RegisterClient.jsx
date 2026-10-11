import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthHeading } from '@/components/auth/AuthLayout';
import { Input, PasswordInput, Textarea, FormAlert, FormSection, SubmitButton } from '@/components/ui/Form';
import { fieldError } from '@/utils/formErrors';

export default function RegisterClient() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
    user_type: 'client',
    client: {
      adresse_livraison: '',
      ville: '',
      code_postal: '',
      pays: 'Madagascar',
      newsletter: false,
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const setClient = (field, value) => setFormData({ ...formData, client: { ...formData.client, [field]: value } });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.password2) {
      setErrors({ password2: ['Les mots de passe ne correspondent pas.'] });
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Compte créé ! Connectez-vous pour commencer vos achats.');
      navigate('/login', { state: { username: formData.username } });
    } catch (err) {
      setErrors(
        err.response?.data && typeof err.response.data === 'object'
          ? err.response.data
          : { general: ["Erreur lors de l'inscription. Réessayez."] }
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const general = fieldError(errors, 'general') || fieldError(errors, 'non_field_errors') || fieldError(errors, 'detail');
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <AuthLayout wide>
      <AuthHeading title="Créer un compte client">
        Déjà inscrit ?{' '}
        <Link to="/login" className="whitespace-nowrap font-semibold text-gray-950 underline underline-offset-4 decoration-emerald-500 decoration-2 hover:decoration-gray-950">
          Connectez-vous
        </Link>
      </AuthHeading>

      <form className="space-y-10" onSubmit={handleSubmit}>
        {hasErrors && (
          <FormAlert title="Certaines informations sont à corriger.">{general}</FormAlert>
        )}

        <FormSection step="01" title="Votre compte">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="username"
              label="Nom d'utilisateur"
              icon={User}
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              error={fieldError(errors, 'username')}
              value={formData.username}
              onChange={set('username')}
            />
            <Input
              id="email"
              type="email"
              label="E-mail"
              icon={Mail}
              required
              autoComplete="email"
              placeholder="vous@exemple.com"
              error={fieldError(errors, 'email')}
              value={formData.email}
              onChange={set('email')}
            />
          </div>
          <Input
            id="phone"
            type="tel"
            label="Téléphone"
            icon={Phone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+261 34 00 000 00"
            error={fieldError(errors, 'phone')}
            value={formData.phone}
            onChange={set('phone')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <PasswordInput
              id="password"
              label="Mot de passe"
              icon={Lock}
              required
              minLength={8}
              autoComplete="new-password"
              hint="8 caractères minimum."
              error={fieldError(errors, 'password')}
              value={formData.password}
              onChange={set('password')}
            />
            <PasswordInput
              id="password2"
              label="Confirmer le mot de passe"
              icon={Lock}
              required
              autoComplete="new-password"
              error={fieldError(errors, 'password2')}
              value={formData.password2}
              onChange={set('password2')}
            />
          </div>
        </FormSection>

        <FormSection
          step="02"
          title="Adresse de livraison"
          description="Facultatif : vous pourrez aussi la saisir au moment de commander."
        >
          <Textarea
            id="adresse_livraison"
            label="Adresse"
            rows={2}
            autoComplete="street-address"
            placeholder="Lot, rue, quartier…"
            error={fieldError(errors, 'client', 'adresse_livraison')}
            value={formData.client.adresse_livraison}
            onChange={(e) => setClient('adresse_livraison', e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="ville"
              label="Ville"
              autoComplete="address-level2"
              placeholder="Antananarivo"
              error={fieldError(errors, 'client', 'ville')}
              value={formData.client.ville}
              onChange={(e) => setClient('ville', e.target.value)}
            />
            <Input
              id="code_postal"
              label="Code postal"
              autoComplete="postal-code"
              inputMode="numeric"
              placeholder="101"
              error={fieldError(errors, 'client', 'code_postal')}
              value={formData.client.code_postal}
              onChange={(e) => setClient('code_postal', e.target.value)}
            />
          </div>
          <label htmlFor="newsletter" className="flex items-start gap-3 p-4 border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
            <input
              id="newsletter"
              type="checkbox"
              checked={formData.client.newsletter}
              onChange={(e) => setClient('newsletter', e.target.checked)}
              className="mt-0.5 w-5 h-5 shrink-0 accent-emerald-600 cursor-pointer"
            />
            <span className="text-sm">
              <span className="block font-semibold text-gray-950">Recevoir la newsletter</span>
              <span className="block text-gray-600">Offres exclusives et nouveautés, sans spam.</span>
            </span>
          </label>
        </FormSection>

        <div className="space-y-4">
          <SubmitButton loading={loading} loadingText="Création du compte…" icon={ArrowRight}>
            Créer mon compte
          </SubmitButton>
          <p className="text-sm text-gray-500">
            En créant un compte, vous acceptez nos{' '}
            <Link to="/terms" className="underline underline-offset-2 hover:text-gray-950">CGU</Link> et notre{' '}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-gray-950">politique de confidentialité</Link>.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
