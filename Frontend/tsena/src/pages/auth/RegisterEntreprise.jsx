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
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="max-w-3xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Inscription Vendeur
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Rejoignez notre communauté de vendeurs
          </p>
        </div>

        {/* Card formulaire */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6">
          
          {/* Formulaire */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm max-h-40 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {/* Section Compte utilisateur */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Compte utilisateur</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="johndoe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength="8"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Min. 8 caractères"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      required
                      value={formData.password2}
                      onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
                      className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Même mot de passe"
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
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Informations entreprise</h3>
              </div>

              {/* Nom entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.entreprise.nom_entreprise}
                    onChange={(e) => updateEntreprise('nom_entreprise', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Ma Super Entreprise"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.entreprise.description}
                  onChange={(e) => updateEntreprise('description', e.target.value)}
                  rows="3"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Décrivez votre activité..."
                />
              </div>

              {/* SIRET & Tel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SIRET
                  </label>
                  <input
                    type="text"
                    value={formData.entreprise.siret}
                    onChange={(e) => updateEntreprise('siret', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="123 456 789 00010"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={formData.entreprise.telephone}
                      onChange={(e) => updateEntreprise('telephone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="+261 34 00 000 00"
                    />
                  </div>
                </div>
              </div>

              {/* Email entreprise */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email entreprise <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.entreprise.email_entreprise}
                    onChange={(e) => updateEntreprise('email_entreprise', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={formData.entreprise.adresse}
                  onChange={(e) => updateEntreprise('adresse', e.target.value)}
                  rows="2"
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                  placeholder="Adresse complète de l'entreprise"
                />
              </div>

              {/* Ville & Code postal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.entreprise.ville}
                    onChange={(e) => updateEntreprise('ville', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Antananarivo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.entreprise.code_postal}
                    onChange={(e) => updateEntreprise('code_postal', e.target.value)}
                    className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="101"
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp (optionnel)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.entreprise.whatsapp}
                    onChange={(e) => updateEntreprise('whatsapp', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="+261 34 00 000 00"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
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
              <Link to="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs sm:text-sm text-gray-600 px-4">
          En créant un compte, vous acceptez nos{' '}
          <Link to="/terms" className="text-orange-600 hover:text-orange-700 underline">
            CGU
          </Link>
        </p>
      </div>
    </div>
  );
}
