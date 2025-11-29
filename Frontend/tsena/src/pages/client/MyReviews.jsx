import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Star, Loader2, MessageSquare, Trash2, Edit } from 'lucide-react';
import api from '@/services/api';

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/avis/mes_avis/');
      setReviews(response.data);
    } catch (err) {
      console.error('Erreur chargement avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (avisId) => {
    if (!window.confirm('Supprimer cet avis ?')) {
      return;
    }

    try {
      await api.delete(`/products/avis/${avisId}/`);
      alert('Avis supprimé !');
      fetchMyReviews();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const renderStars = (note) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= note
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (approuve) => {
    if (approuve) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
          ✓ Approuvé
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
        ⏳ En attente
        </span>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mes Avis</h1>
          <p className="text-gray-600 mt-1">
            Gérez tous vos avis et commentaires
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total avis</p>
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Approuvés</p>
            <p className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.approuve).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border border-yellow-200">
            <p className="text-sm text-gray-600 mb-1">En attente</p>
            <p className="text-2xl font-bold text-yellow-600">
              {reviews.filter(r => !r.approuve).length}
            </p>
          </div>
        </div>

        {/* Liste des avis */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun avis
            </h3>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore laissé d'avis
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Découvrir des produits
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      to={`/products/${review.produit}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {review.produit_nom}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(review.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {getStatusBadge(review.approuve)}
                </div>

                {/* Note */}
                <div className="mb-3">
                  {renderStars(review.note)}
                </div>

                {/* Titre */}
                {review.titre && (
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {review.titre}
                  </h4>
                )}

                {/* Commentaire */}
                <p className="text-gray-700 mb-4">
                  {review.commentaire}
                </p>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-3 border-t">
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
