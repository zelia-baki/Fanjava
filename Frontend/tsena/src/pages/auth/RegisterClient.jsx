import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserPlus } from 'lucide-react';

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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.password2) {
      setErrors({ password2: ['Les mots de passe ne correspondent pas'] });
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) {
      setErrors(err.response?.data || { general: ['Erreur lors de l\'inscription'] });
    } finally {
      setLoading(false);
    }
  };

  const updateClient = (field, value) => {
    setFormData({
      ...formData,
      client: { ...formData.client, [field]: value },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Inscription Client</h2>
          <p className="mt-2 text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Se connecter
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general.join(', ')}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone (format: +261123456789)
              </label>
              <input
                type="tel"
                placeholder="+261123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe (min 8 caractères, lettres + chiffres)
              </label>
              <input
                type="password"
                required
                minLength="8"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirmer mot de passe</label>
              <input
                type="password"
                required
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password2 && (
                <p className="text-red-500 text-sm mt-1">{errors.password2.join(', ')}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <textarea
                value={formData.client.adresse_livraison}
                onChange={(e) => updateClient('adresse_livraison', e.target.value)}
                rows="2"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Ville</label>
                <input
                  type="text"
                  value={formData.client.ville}
                  onChange={(e) => updateClient('ville', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Code postal</label>
                <input
                  type="text"
                  value={formData.client.code_postal}
                  onChange={(e) => updateClient('code_postal', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.client.newsletter}
                onChange={(e) => updateClient('newsletter', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                S'abonner à la newsletter
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </button>
        </form>
      </div>
    </div>
  );
}