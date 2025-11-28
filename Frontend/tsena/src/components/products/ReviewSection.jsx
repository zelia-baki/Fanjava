import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { productService } from '@/services/productService';
import ReviewForm from './ReviewForm';

const ReviewSection = ({ product, user, onReviewAdded }) => {
  const [reviews, setReviews] = useState(product.avis || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

  const userHasReviewed = reviews.some(
    (review) => user && review.client === user.client?.id
  );

  const canLeaveReview = user && user.user_type === 'client' && !userHasReviewed;

  const handleReviewSubmitted = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    setShowReviewForm(false);
    setEditingReview(null);
    if (onReviewAdded) onReviewAdded();
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      await productService.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      if (onReviewAdded) onReviewAdded();
    } catch (error) {
      alert('Erreur lors de la suppression de l\'avis');
      console.error(error);
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter((review) => review.note === parseInt(filter));

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.note === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter((r) => r.note === rating).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Avis clients ({reviews.length})
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Résumé des notes */}
        <div className="lg:col-span-1">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-800 mb-2">
              {product.note_moyenne?.toFixed(1) || '0.0'}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < Math.floor(product.note_moyenne || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Basé sur {reviews.length} avis
            </p>
          </div>

          {/* Distribution des notes */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                onClick={() => setFilter(filter === rating.toString() ? 'all' : rating.toString())}
                className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 ${
                  filter === rating.toString() ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-sm font-medium w-12">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </button>
            ))}
          </div>

          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="w-full mt-4 text-sm text-blue-600 hover:underline"
            >
              Afficher tous les avis
            </button>
          )}
        </div>

        {/* Liste des avis */}
        <div className="lg:col-span-2">
          {/* Bouton pour laisser un avis */}
          {canLeaveReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full mb-6 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Laisser un avis
            </button>
          )}

          {/* Formulaire d'avis */}
          {showReviewForm && (
            <div className="mb-6">
              <ReviewForm
                productId={product.id}
                existingReview={editingReview}
                onSubmit={handleReviewSubmitted}
                onCancel={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                }}
              />
            </div>
          )}

          {/* Message si pas connecté */}
          {!user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Connectez-vous pour laisser un avis sur ce produit
              </p>
            </div>
          )}

          {/* Message si déjà laissé un avis */}
          {user && user.user_type === 'client' && userHasReviewed && !showReviewForm && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">
                Vous avez déjà laissé un avis pour ce produit
              </p>
            </div>
          )}

          {/* Liste des avis */}
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filter === 'all' 
                ? 'Aucun avis pour le moment' 
                : `Aucun avis avec ${filter} étoile${filter > 1 ? 's' : ''}`
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">
                          {review.client_prenom || review.client_nom}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.note
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Actions pour l'auteur */}
                    {review.peut_modifier && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {review.titre && (
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {review.titre}
                    </h4>
                  )}

                  <p className="text-gray-600 mb-3">{review.commentaire}</p>

                  {review.approuve === false && (
                    <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                      En attente de modération
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;