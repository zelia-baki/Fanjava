import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { productService } from '@/services/productService';

const ReviewForm = ({ productId, existingReview, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    note: existingReview?.note || 0,
    titre: existingReview?.titre || '',
    commentaire: existingReview?.commentaire || '',
  });
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.note === 0) {
      setError('Veuillez sélectionner une note');
      return;
    }

    if (formData.commentaire.trim().length < 10) {
      setError('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);

    try {
      const data = {
        produit: productId,
        ...formData,
      };

      let result;
      if (existingReview) {
        result = await productService.updateReview(existingReview.id, data);
      } else {
        result = await productService.addReview(data);
      }

      onSubmit(result);
    } catch (err) {
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.message
        || (existingReview ? 'Erreur lors de la modification de l\'avis' : 'Erreur lors de l\'ajout de l\'avis');
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {existingReview ? 'Modifier votre avis' : 'Laisser un avis'}
      </h3>

      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Note avec étoiles */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, note: star }))}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoveredStar || formData.note)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              />
            </button>
          ))}
        </div>
        {formData.note > 0 && (
          <p className="mt-1 text-sm text-gray-600">
            {formData.note} étoile{formData.note > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Titre */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titre (optionnel)
        </label>
        <input
          type="text"
          value={formData.titre}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, titre: e.target.value }))
          }
          placeholder="Résumez votre avis en quelques mots"
          maxLength={200}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Commentaire */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaire <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.commentaire}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, commentaire: e.target.value }))
          }
          placeholder="Partagez votre expérience avec ce produit..."
          rows={5}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">
          Minimum 10 caractères ({formData.commentaire.length})
        </p>
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Envoi...' : existingReview ? 'Modifier' : 'Publier'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;