import { useState } from 'react';
import { authService } from '@/services/authService';
import { Lock, Loader2 } from 'lucide-react';

/** Formulaire « changer mon mot de passe » (utilisateur connecté) */
export default function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmation) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      setMessage({ type: 'success', text: 'Mot de passe modifié.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmation('');
    } catch (err) {
      const data = err.response?.data || {};
      const text = [].concat(data.old_password || data.new_password || data.detail || []).join(' ');
      setMessage({ type: 'error', text: text || 'Impossible de modifier le mot de passe.' });
    } finally {
      setLoading(false);
    }
  };

  const champs = [
    ['Mot de passe actuel', oldPassword, setOldPassword, 'current-password'],
    ['Nouveau mot de passe', newPassword, setNewPassword, 'new-password'],
    ['Confirmer le nouveau mot de passe', confirmation, setConfirmation, 'new-password'],
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mt-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
          <Lock className="w-4 h-4 text-emerald-600" />
        </div>
        Changer mon mot de passe
      </h3>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {champs.map(([label, value, setValue, autoComplete]) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <input
              type="password"
              required
              autoComplete={autoComplete}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center font-medium disabled:bg-gray-300 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Modifier le mot de passe
        </button>
      </div>
    </form>
  );
}
