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
    { value: 'confirmed', label: 'Confirmée', color: 'blue' },
    { value: 'processing', label: 'En préparation', color: 'purple' },
    { value: 'shipped', label: 'Expédiée', color: 'indigo' },
    { value: 'delivered', label: 'Livrée', color: 'green' },
    { value: 'cancelled', label: 'Annulée', color: 'red' },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
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

  if (!order) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Commande non trouvée</h2>
          <button
            onClick={() => navigate('/entreprise/orders')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Retour aux commandes
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Commande #{order.numero_commande}
            </h1>
            <p className="text-gray-600 mt-1">
              Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`mt-4 sm:mt-0 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {statusOptions.find(s => s.value === order.status)?.label}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Produits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Produits commandés
              </h2>
              <div className="divide-y divide-gray-200">
                {order.lignes && order.lignes.map((ligne) => (
                  <div key={ligne.id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-gray-900">{ligne.nom_produit}</p>
                        <p className="text-sm text-gray-600">Quantité: {ligne.quantite}</p>
                        <p className="text-sm text-gray-600">
                          Prix unitaire: {parseFloat(ligne.prix_unitaire).toFixed(2)} Ar
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {parseFloat(ligne.prix_total).toFixed(2)} Ar
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-medium">{parseFloat(order.montant_total).toFixed(2)} Ar</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Frais de livraison</span>
                  <span className="font-medium">{parseFloat(order.frais_livraison).toFixed(2)} Ar</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{parseFloat(order.montant_final).toFixed(2)} Ar</span>
                </div>
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Informations de livraison
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium text-gray-900">{order.adresse_livraison}</p>
                  <p className="text-gray-700">
                    {order.code_postal_livraison} {order.ville_livraison}, {order.pays_livraison}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium text-gray-900">{order.telephone_livraison}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mode de livraison</p>
                  <p className="font-medium text-gray-900 capitalize">{order.mode_livraison}</p>
                </div>
                {order.note_client && (
                  <div>
                    <p className="text-sm text-gray-600">Note du client</p>
                    <p className="text-gray-700 italic">"{order.note_client}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gestion de la commande */}
          <div className="space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Client
              </h2>
              <div>
                <p className="font-medium text-gray-900">{order.client_nom || 'Client'}</p>
                <p className="text-sm text-gray-600">{order.client_email}</p>
              </div>
            </div>

            {/* Modifier le statut */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Bouton sauvegarder */}
                <button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === order.status}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Historique</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Commande créée</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                {order.updated_at !== order.created_at && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
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
    </MainLayout>
  );
}
