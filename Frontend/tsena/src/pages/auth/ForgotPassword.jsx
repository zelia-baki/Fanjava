import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '@/services/authService';
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

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
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Impossible d'envoyer la demande. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
            <KeyRound className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Mot de passe oublié</h2>
          <p className="text-gray-600">Entrez votre e-mail pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-gray-700 text-sm">
                Si un compte existe pour <strong>{email}</strong>, un e-mail contenant un lien de
                réinitialisation vient d'être envoyé. Le lien est valable 3 jours.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">{error}</div>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse e-mail
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="vous@exemple.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer le lien'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center">
          <Link to="/login" className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
