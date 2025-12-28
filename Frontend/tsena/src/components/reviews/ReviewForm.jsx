import { useState } from 'react';
import { Star, Loader2, Send } from 'lucide-react';
import api from '@/services/api';

export default function ReviewForm({ produitId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    note: 5,
    titre: '',
    commentaire: ''
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.commentaire.trim() || formData.commentaire.length < 10) {
    setError('Le commentaire doit contenir au moins 10 caractères');
    return;
  }

  try {
    setSubmitting(true);
    setError(null);

    const dataToSend = {
      produit: produitId,
      note: formData.note,
      titre: formData.titre,
      commentaire: formData.commentaire
    };
    
    console.log('📤 Données envoyées:', dataToSend);  // ← DEBUG

    const response = await api.post('/products/avis/', dataToSend);
    
    console.log('✅ Réponse:', response.data);  // ← DEBUG

    alert('Votre avis a été soumis avec succès !');
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('❌ Erreur complète:', err);
    console.error('❌ Réponse serveur:', err.response?.data);  // ← IMPORTANT
    setError(
      err.response?.data?.error || 
      err.response?.data?.detail ||
      JSON.stringify(err.response?.data) ||  // ← Affiche toutes les erreurs
      'Erreur lors de la soumission de votre avis'
    );
  } finally {
    setSubmitting(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Laisser un avis</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Note avec étoiles */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre note *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, note: star }))}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredStar || formData.note)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {formData.note} sur 5
            </span>
          </div>
        </div>

        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de votre avis (optionnel)
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            maxLength={100}
            placeholder="Ex: Excellent produit !"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Votre commentaire * (minimum 10 caractères)
          </label>
          <textarea
            name="commentaire"
            value={formData.commentaire}
            onChange={handleChange}
            rows={5}
            placeholder="Partagez votre expérience avec ce produit..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.commentaire.length} caractères
          </p>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Boutons */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Soumettre mon avis
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
