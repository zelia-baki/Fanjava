import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, User, Mail, Lock, Phone, MapPin, Loader2, Eye, EyeOff, Check } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
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
      alert('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* 🎨 BACKGROUND ANIMÉ */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/backgrounds/register_animated.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0"></div>

      {/* Contenu */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Card principale */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-8 space-y-6 transform transition-all hover:scale-[1.01]">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4 transform transition-transform hover:scale-110 hover:rotate-6">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Inscription Client
            </h2>
            <p className="text-gray-600">
              Créez votre compte et commencez vos achats
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-shake">
                {errors.general.join(', ')}
              </div>
            )}

            {/* Section Compte */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Informations du compte</h3>
              </div>

              {/* Username & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom d'utilisateur *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="johndoe"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Téléphone
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="+261 34 00 000 00"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.join(', ')}</p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mot de passe *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength="8"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.join(', ')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirmer *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      required
                      value={formData.password2}
                      onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword2 ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password2 && (
                    <p className="text-red-500 text-xs mt-1">{errors.password2.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section Adresse */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Adresse de livraison</h3>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Adresse complète
                </label>
                <textarea
                  value={formData.client.adresse_livraison}
                  onChange={(e) => updateClient('adresse_livraison', e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="Lot, rue, quartier..."
                />
              </div>

              {/* Ville & Code postal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.client.ville}
                    onChange={(e) => updateClient('ville', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Antananarivo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.client.code_postal}
                    onChange={(e) => updateClient('code_postal', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="101"
                  />
                </div>
              </div>

              {/* Newsletter */}
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.client.newsletter}
                  onChange={(e) => updateClient('newsletter', e.target.checked)}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all"
                />
                <label className="ml-3 block text-sm text-gray-700">
                  <span className="font-semibold">Recevoir la newsletter</span>
                  <span className="block text-xs text-gray-500">Offres exclusives et nouveautés</span>
                </label>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Créer mon compte</span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          En créant un compte, vous acceptez nos{' '}
          <Link to="/terms" className="text-green-600 hover:text-green-700 font-medium">
            Conditions d'utilisation
          </Link>
        </p>
      </div>
    </div>
  );
}