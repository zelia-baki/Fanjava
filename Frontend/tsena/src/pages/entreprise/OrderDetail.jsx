import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { 
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  Loader2,
  Save
} from 'lucide-react';
import api from '@/services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [numeroSuivi, setNumeroSuivi] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/commandes/${id}/`);
      setOrder(response.data);
      setNewStatus(response.data.status);
      setNumeroSuivi(response.data.numero_suivi || '');
    } catch (err) {
      console.error('Erreur chargement commande:', err);
      alert('Erreur lors du chargement de la commande');
      navigate('/entreprise/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await api.patch(`/orders/commandes/${id}/`, {
        status: newStatus,
        numero_suivi: numeroSuivi || null
      });
      alert('Commande mise à jour avec succès !');
      fetchOrder();
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      alert('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'En attente', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmée', color: 'emerald' },
    { value: 'processing', label: 'En préparation', color: 'blue' },
    { value: 'shipped', label: 'Expédiée', color: 'indigo' },
    { value: 'delivered', label: 'Livrée', color: 'green' },
    { value: 'cancelled', label: 'Annulée', color: 'red' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-indigo-100 text-indigo-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex justify-center items-center">
          <div className="flex items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <span className="text-gray-600">Chargement...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Commande non trouvée</h2>
            <button
              onClick={() => navigate('/entreprise/orders')}
              className="text-orange-600 hover:text-orange-700 underline"
            >
              Retour aux commandes
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Commande #{order.numero_commande}
              </h1>
              <p className="text-gray-600 mt-1 text-sm">
                Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(order.status)}`}>
              {statusOptions.find(s => s.value === order.status)?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Produits */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                    <Package className="w-4 h-4 text-orange-600" />
                  </div>
                  Produits commandés
                </h2>
                <div className="divide-y divide-gray-200">
                  {order.lignes && order.lignes.map((ligne) => (
                    <div key={ligne.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded border border-gray-200 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{ligne.nom_produit}</p>
                          <p className="text-xs sm:text-sm text-gray-600">Quantité: {ligne.quantite}</p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Prix unitaire: {parseFloat(ligne.prix_unitaire).toLocaleString()} Ar
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">
                          {parseFloat(ligne.prix_total).toLocaleString()} Ar
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total</span>
                    <span className="font-medium text-gray-900">{parseFloat(order.montant_total).toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frais de livraison</span>
                    <span className="font-medium text-gray-900">{parseFloat(order.frais_livraison).toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-gray-900">{parseFloat(order.montant_final).toLocaleString()} Ar</span>
                  </div>
                </div>
              </div>

              {/* Informations de livraison */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                  </div>
                  Informations de livraison
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Adresse</p>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">{order.adresse_livraison}</p>
                    <p className="text-gray-700 text-sm">
                      {order.code_postal_livraison} {order.ville_livraison}, {order.pays_livraison}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Téléphone</p>
                    <p className="font-medium text-gray-900 text-sm">{order.telephone_livraison}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Mode de livraison</p>
                    <p className="font-medium text-gray-900 capitalize text-sm">{order.mode_livraison}</p>
                  </div>
                  {order.note_client && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">Note du client</p>
                      <p className="text-gray-700 italic text-sm">"{order.note_client}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gestion de la commande */}
            <div className="space-y-6">
              {/* Informations client */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  Client
                </h2>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{order.client_nom || 'Client'}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{order.client_email}</p>
                </div>
              </div>

              {/* Modifier le statut */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center mr-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  Gérer la commande
                </h2>

                <div className="space-y-4">
                  {/* Statut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut de la commande
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Numéro de suivi */}
                  {(newStatus === 'shipped' || newStatus === 'delivered') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de suivi
                      </label>
                      <input
                        type="text"
                        value={numeroSuivi}
                        onChange={(e) => setNumeroSuivi(e.target.value)}
                        placeholder="Ex: TRK123456789"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  )}

                  {/* Bouton sauvegarder */}
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating || newStatus === order.status}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Historique</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Commande créée</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  {order.updated_at !== order.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Dernière mise à jour</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.updated_at).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
