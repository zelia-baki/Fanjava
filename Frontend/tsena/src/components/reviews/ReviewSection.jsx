import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function ReviewSection({ produitId, noteMoyenne, nombreAvis }) {
  const { user } = useAuth();
  const [avis, setAvis] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAvis();
    checkCanReview();
  }, [produitId]);

  const fetchAvis = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/avis/?produit=${produitId}`);
      setAvis(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
      setAvis([]);
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!user || !user.client) {
      setCanReview(false);
      return;
    }

    try {
      const response = await api.get(`/products/avis/?produit=${produitId}`);
      const hasReviewed = response.data.results?.some(
        review => review.client === user.client.id
      );
      setCanReview(!hasReviewed);
    } catch (err) {
      console.error('Erreur vérification avis:', err);
      setCanReview(true);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    fetchAvis();
    checkCanReview();
  };

  const renderRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    avis.forEach(review => {
      if (distribution[review.note] !== undefined) {
        distribution[review.note]++;
      }
    });

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution[star];
          const percentage = avis.length > 0 ? (count / avis.length) * 100 : 0;
          
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600 w-12 sm:w-16">{star} étoiles</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Avis clients</h2>

      {/* Résumé des notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {/* Note moyenne */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {noteMoyenne ? parseFloat(noteMoyenne).toFixed(1) : '0.0'}
          </div>
          <div className="flex items-center justify-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  star <= Math.round(parseFloat(noteMoyenne || 0))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs sm:text-sm text-gray-600">
            Basé sur {nombreAvis || 0} avis
          </p>
        </div>

        {/* Distribution des notes */}
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm sm:text-base">Distribution</h3>
          {renderRatingDistribution()}
        </div>
      </div>

      {/* Bouton pour laisser un avis */}
      {user && user.client && canReview && !showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
          >
            <Star className="w-5 h-5 mr-2" />
            Laisser un avis
          </button>
        </div>
      )}

      {/* Formulaire d'avis */}
      {showForm && (
        <div className="mb-6">
          <ReviewForm
            produitId={produitId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Liste des avis */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="ml-3 text-gray-600">Chargement des avis...</span>
        </div>
      ) : (
        <ReviewList avis={avis} />
      )}
    </div>
  );
}
