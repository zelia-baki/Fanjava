import { Star, User, ThumbsUp, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReviewList({ avis }) {
  const renderStars = (note) => {
    return (
      <div className="flex items-center gap-1">
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!avis || avis.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 font-medium text-sm sm:text-base">Aucun avis pour le moment</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">Soyez le premier à laisser un avis !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {avis.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6"
        >
          {/* En-tête */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                  {review.client_prenom || review.client_nom || 'Client'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
            {renderStars(review.note)}
          </div>

          {/* Produit (si disponible) */}
          {review.produit_details && (
            <Link 
              to={`/products/${review.produit_details.slug}`}
              className="flex items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {review.produit_details.image ? (
                <img
                  src={review.produit_details.image}
                  alt={review.produit_details.nom}
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {review.produit_details.nom}
                </p>
                <p className="text-gray-900 text-sm font-semibold">
                  {parseFloat(review.produit_details.prix_final).toLocaleString()} Ar
                </p>
              </div>
            </Link>
          )}

          {/* Titre */}
          {review.titre && (
            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
              {review.titre}
            </h4>
          )}

          {/* Commentaire */}
          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
            {review.commentaire}
          </p>

          {/* Badge vérifié */}
          {review.approuve && (
            <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              <ThumbsUp className="w-3 h-3 mr-1" />
              Avis vérifié
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
