import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Building2, User, Mail, Lock, Phone, MapPin, Loader2, Eye, EyeOff, Check, Briefcase } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      alert('✅ Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (err) {
      console.error('Erreur inscription:', err);
      let errorMsg = 'Erreur lors de l\'inscription';
      
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMsg = JSON.stringify(err.response.data, null, 2);
        } else {
          errorMsg = err.response.data.message || err.response.data;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateEntreprise = (field, value) => {
    setFormData({
      ...formData,
      entreprise: { ...formData.entreprise, [field]: value },
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
      <div className="relative z-10 max-w-3xl w-full">
        {/* Card principale */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-8 space-y-6 transform transition-all hover:scale-[1.01]">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg mb-4 transform transition-transform hover:scale-110 hover:rotate-6">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              Inscription Entreprise
            </h2>
            <p className="text-gray-600">
              Rejoignez notre communauté de vendeurs
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg animate-shake">
                <pre className="text-xs overflow-x-auto">{error}</pre>
              </div>
            )}

            {/* Section Compte utilisateur */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Compte utilisateur</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Nom d'utilisateur *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mot de passe *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
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
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Confirmer *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      required
                      value={formData.password2}
                      onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
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
                </div>
              </div>
            </div>

            {/* Section Entreprise */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Informations entreprise</h3>
              </div>

              {/* Nom entreprise */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nom de l'entreprise *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.entreprise.nom_entreprise}
                    onChange={(e) => updateEntreprise('nom_entreprise', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Ma Super Entreprise"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.entreprise.description}
                  onChange={(e) => updateEntreprise('description', e.target.value)}
                  rows="3"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="Décrivez votre activité..."
                />
              </div>

              {/* SIRET & Tel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.entreprise.siret}
                    onChange={(e) => updateEntreprise('siret', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="123 456 789 00010"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Téléphone entreprise *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.entreprise.telephone}
                      onChange={(e) => updateEntreprise('telephone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                      placeholder="+261 34 00 000 00"
                    />
                  </div>
                </div>
              </div>

              {/* Email entreprise */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email entreprise *
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.entreprise.email_entreprise}
                    onChange={(e) => updateEntreprise('email_entreprise', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Adresse *
                </label>
                <textarea
                  required
                  value={formData.entreprise.adresse}
                  onChange={(e) => updateEntreprise('adresse', e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="Adresse complète de l'entreprise"
                />
              </div>

              {/* Ville & Code postal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.entreprise.ville}
                    onChange={(e) => updateEntreprise('ville', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="Antananarivo"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.entreprise.code_postal}
                    onChange={(e) => updateEntreprise('code_postal', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="101"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  WhatsApp (optionnel)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    value={formData.entreprise.whatsapp}
                    onChange={(e) => updateEntreprise('whatsapp', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white"
                    placeholder="+261 34 00 000 00"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>Créer mon entreprise</span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          En créant un compte, vous acceptez nos{' '}
          <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
            Conditions d'utilisation
          </Link>
        </p>
      </div>
    </div>
  );
}