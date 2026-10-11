import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { User, Mail, Lock, Phone, Briefcase, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthHeading } from '@/components/auth/AuthLayout';
import { Input, PasswordInput, Textarea, FormAlert, FormSection, SubmitButton } from '@/components/ui/Form';
import { fieldError } from '@/utils/formErrors';

export default function RegisterEntreprise() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
    user_type: 'entreprise',
    entreprise: {
      nom_entreprise: '',
      description: '',
      siret: '',
      adresse: '',
      ville: '',
      code_postal: '',
      pays: 'Madagascar',
      telephone: '',
      email_entreprise: '',
      whatsapp: '',
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });
  const setEntreprise = (field) => (e) =>
    setFormData({ ...formData, entreprise: { ...formData.entreprise, [field]: e.target.value } });
  const errEntreprise = (field) => fieldError(errors, 'entreprise', field);

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
      toast.success('Boutique créée ! Connectez-vous pour ajouter vos produits.');
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
    <AuthLayout variant="seller" wide>
      <AuthHeading title="Ouvrir ma boutique">
        Déjà vendeur sur FanJava ?{' '}
        <Link to="/login" className="whitespace-nowrap font-semibold text-gray-950 underline underline-offset-4 decoration-orange-500 decoration-2 hover:decoration-gray-950">
          Connectez-vous
        </Link>
      </AuthHeading>

      <form className="space-y-10" onSubmit={handleSubmit}>
        {hasErrors && (
          <FormAlert title="Certaines informations sont à corriger.">{general}</FormAlert>
        )}

        <FormSection step="01" title="Votre compte" description="Ces identifiants servent à vous connecter à votre espace vendeur.">
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
              label="E-mail personnel"
              icon={Mail}
              required
              autoComplete="email"
              placeholder="vous@exemple.com"
              error={fieldError(errors, 'email')}
              value={formData.email}
              onChange={set('email')}
            />
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

        <FormSection step="02" title="Votre entreprise" description="Ces informations apparaissent sur votre boutique.">
          <Input
            id="nom_entreprise"
            label="Nom de l'entreprise"
            icon={Briefcase}
            required
            autoComplete="organization"
            error={errEntreprise('nom_entreprise')}
            value={formData.entreprise.nom_entreprise}
            onChange={setEntreprise('nom_entreprise')}
          />
          <Textarea
            id="description"
            label="Description"
            placeholder="Ce que vous vendez, ce qui vous rend unique…"
            error={errEntreprise('description')}
            value={formData.entreprise.description}
            onChange={setEntreprise('description')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="telephone"
              type="tel"
              label="Téléphone"
              icon={Phone}
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="+261 34 00 000 00"
              error={errEntreprise('telephone')}
              value={formData.entreprise.telephone}
              onChange={setEntreprise('telephone')}
            />
            <Input
              id="whatsapp"
              type="tel"
              label="WhatsApp"
              icon={Phone}
              inputMode="tel"
              placeholder="+261 34 00 000 00"
              error={errEntreprise('whatsapp')}
              value={formData.entreprise.whatsapp}
              onChange={setEntreprise('whatsapp')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="email_entreprise"
              type="email"
              label="E-mail de l'entreprise"
              icon={Mail}
              required
              placeholder="contact@entreprise.mg"
              error={errEntreprise('email_entreprise')}
              value={formData.entreprise.email_entreprise}
              onChange={setEntreprise('email_entreprise')}
            />
            <Input
              id="siret"
              label="NIF / STAT"
              hint="Numéro d'identification de l'entreprise."
              error={errEntreprise('siret')}
              value={formData.entreprise.siret}
              onChange={setEntreprise('siret')}
            />
          </div>
        </FormSection>

        <FormSection step="03" title="Adresse">
          <Textarea
            id="adresse"
            label="Adresse"
            rows={2}
            required
            autoComplete="street-address"
            placeholder="Lot, rue, quartier…"
            error={errEntreprise('adresse')}
            value={formData.entreprise.adresse}
            onChange={setEntreprise('adresse')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="ville"
              label="Ville"
              required
              autoComplete="address-level2"
              placeholder="Antananarivo"
              error={errEntreprise('ville')}
              value={formData.entreprise.ville}
              onChange={setEntreprise('ville')}
            />
            <Input
              id="code_postal"
              label="Code postal"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="101"
              error={errEntreprise('code_postal')}
              value={formData.entreprise.code_postal}
              onChange={setEntreprise('code_postal')}
            />
          </div>
        </FormSection>

        <div className="space-y-4">
          <SubmitButton loading={loading} loadingText="Création de la boutique…" icon={ArrowRight}>
            Créer ma boutique
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
