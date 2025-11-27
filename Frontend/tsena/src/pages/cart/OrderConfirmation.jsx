import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '@/services/orderService';
import MainLayout from '@/layouts/MainLayout';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const data = await orderService.getOrderDetail(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Erreur chargement commande:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Chargement...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600">
            Votre commande a été enregistrée avec succès
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-600">Numéro de commande</p>
              <p className="text-xl font-bold">{order?.numero_commande}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">
                {new Date(order?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Articles commandés
            </h3>
            <div className="space-y-2">
              {order?.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.produit_nom} x {item.quantite}
                  </span>
                  <span className="font-medium">
                    {(item.prix_unitaire * item.quantite).toFixed(2)} Ar
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">{order?.montant_total} Ar</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Adresse de livraison</h3>
            <p className="text-sm text-gray-700">{order?.adresse_livraison}</p>
            <p className="text-sm text-gray-700">
              {order?.ville}, {order?.code_postal}
            </p>
            <p className="text-sm text-gray-700">{order?.pays}</p>
          </div>

          <div className="text-center space-y-3">
            <Link
              to="/dashboard/client"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Voir mes commandes
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 font-semibold"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}