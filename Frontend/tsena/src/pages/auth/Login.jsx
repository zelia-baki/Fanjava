import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ShoppingBag, Store, User, Lock, ChevronRight } from 'lucide-react';
import AuthLayout, { AuthHeading } from '@/components/auth/AuthLayout';
import { Input, PasswordInput, FormAlert, SubmitButton } from '@/components/ui/Form';

function messageErreur(err) {
  if (!err.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.';
  if ([400, 401].includes(err.response.status)) return "Nom d'utilisateur ou mot de passe incorrect.";
  return 'Une erreur est survenue. Réessayez dans quelques instants.';
}

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ username: location.state?.username || '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Page demandée avant la redirection vers /login (ProtectedRoute)
  const destination = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  if (user && !loading) return <Navigate to={destination} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(formData.username.trim(), formData.password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(messageErreur(err));
      setFormData((d) => ({ ...d, password: '' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthHeading title="Connexion">
        Content de vous revoir. Pas encore de compte ?{' '}
        <Link to="/register/client" className="whitespace-nowrap font-semibold text-gray-950 underline underline-offset-4 decoration-emerald-500 decoration-2 hover:decoration-gray-950">
          Inscrivez-vous
        </Link>
      </AuthHeading>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && <FormAlert>{error}</FormAlert>}

        <Input
          id="username"
          label="Nom d'utilisateur"
          icon={User}
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus={!formData.username}
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />

        <div>
          <PasswordInput
            id="password"
            label="Mot de passe"
            icon={Lock}
            required
            autoComplete="current-password"
            autoFocus={Boolean(formData.username)}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="inline-block py-1 text-sm font-medium text-gray-600 hover:text-gray-950 underline-offset-4 hover:underline">
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <SubmitButton loading={loading} loadingText="Connexion…" icon={ArrowRight}>
          Se connecter
        </SubmitButton>
      </form>

      {/* Inscription */}
      <div className="mt-10">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-3">Nouveau sur FanJava ?</p>
        <div className="grid gap-3">
          {[
            { to: '/register/client', icon: ShoppingBag, title: 'Compte client', text: 'Acheter et suivre mes commandes', hover: 'hover:border-emerald-600' },
            { to: '/register/entreprise', icon: Store, title: 'Devenir vendeur', text: 'Ouvrir ma boutique en ligne', hover: 'hover:border-orange-500' },
          ].map(({ to, icon, title, text, hover }) => {
            const Icon = icon;
            return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 p-4 border-2 border-gray-200 ${hover} transition-colors`}
            >
              <Icon className="w-6 h-6 shrink-0 text-gray-950" aria-hidden="true" />
              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-gray-950">{title}</span>
                <span className="block text-sm text-gray-600">{text}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-950 group-hover:translate-x-0.5 transition" aria-hidden="true" />
            </Link>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        En vous connectant, vous acceptez nos{' '}
        <Link to="/terms" className="underline underline-offset-2 hover:text-gray-950">CGU</Link> et notre{' '}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-gray-950">politique de confidentialité</Link>.
      </p>
    </AuthLayout>
  );
}
