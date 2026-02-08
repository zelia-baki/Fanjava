import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
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
      // Les données sont déjà enrichies par le backend
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
            <div key={star} className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 w-12">{star} étoiles</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Avis clients</h2>

      {/* Résumé des notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Note moyenne */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {noteMoyenne ? parseFloat(noteMoyenne).toFixed(1) : '0.0'}
          </div>
          <div className="flex items-center justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(parseFloat(noteMoyenne || 0))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Basé sur {nombreAvis || 0} avis
          </p>
        </div>

        {/* Distribution des notes */}
        <div className="md:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Distribution</h3>
          {renderRatingDistribution()}
        </div>
      </div>

      {/* Bouton pour laisser un avis */}
      {user && user.client && canReview && !showForm && (
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
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
        <div className="text-center py-8">
          <p className="text-gray-600">Chargement des avis...</p>
        </div>
      ) : avis.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">Aucun avis pour le moment</p>
          <p className="text-sm text-gray-500 mt-1">Soyez le premier à laisser un avis !</p>
        </div>
      ) : (
        <ReviewList avis={avis} />
      )}
    </div>
  );
}