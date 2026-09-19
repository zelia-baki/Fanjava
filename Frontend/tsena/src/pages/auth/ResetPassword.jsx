import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { Lock, Loader2, CheckCircle, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.new_password?.join(' ') ||
          data?.detail ||
          'Lien invalide ou expiré. Refaites une demande de réinitialisation.'
      );
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
          <p className="text-gray-600">Choisissez un nouveau mot de passe pour votre compte</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 space-y-6">
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-gray-700 text-sm">Votre mot de passe a été modifié.</p>
              <Link
                to="/login"
                className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
                  {error}{' '}
                  <Link to="/forgot-password" className="underline">
                    Nouvelle demande
                  </Link>
                </div>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {[
                  ['password', 'Nouveau mot de passe', password, setPassword],
                  ['confirmation', 'Confirmer le mot de passe', confirmation, setConfirmation],
                ].map(([id, label, value, setValue]) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id={id}
                        type="password"
                        required
                        autoComplete="new-password"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Modifier le mot de passe'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
