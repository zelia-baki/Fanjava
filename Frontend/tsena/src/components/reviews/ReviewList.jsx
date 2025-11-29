import { Star, User, ThumbsUp } from 'lucide-react';


export default function ReviewList({ avis }) {
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
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Aucun avis pour le moment</p>
        <p className="text-sm text-gray-500 mt-1">Soyez le premier à laisser un avis !</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {avis.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* En-tête */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {review.client_prenom || review.client_nom || 'Client'}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
            {renderStars(review.note)}
          </div>

          {/* Titre */}
          {review.titre && (
            <h4 className="font-semibold text-gray-900 mb-2">
              {review.titre}
            </h4>
          )}

          {/* Commentaire */}
          <p className="text-gray-700 leading-relaxed">
            {review.commentaire}
          </p>

          {/* Badge vérifié */}
          {review.approuve && (
            <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
              <ThumbsUp className="w-3 h-3 mr-1" />
              Avis vérifié
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
