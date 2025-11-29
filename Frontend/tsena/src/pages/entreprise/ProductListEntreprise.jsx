import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Loader2,
  Eye,
  AlertCircle
} from 'lucide-react';
import api from '@/services/api';

export default function ProductListEntreprise() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/produits/', {
        params: { mes_produits: 'true' }
      });
      setProducts(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productSlug, productName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer "${productName}" ?`)) {
      return;
    }

    try {
      setDeleteLoading(productSlug);
      // ✅ CORRIGÉ : Utiliser le slug pour la suppression
      await api.delete(`/products/produits/${productSlug}/`);
      setProducts(products.filter(p => p.slug !== productSlug));
      alert('Produit supprimé avec succès !');
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('Erreur lors de la suppression du produit');
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.nom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || product.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      inactive: 'bg-red-100 text-red-800',
      out_of_stock: 'bg-orange-100 text-orange-800'
    };
    const labels = {
      active: 'Actif',
      draft: 'Brouillon',
      inactive: 'Inactif',
      out_of_stock: 'Rupture'
    };
    return { style: styles[status] || styles.draft, label: labels[status] || status };
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3">Chargement des produits...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Produits</h1>
            <p className="text-gray-600 mt-1">{products.length} produit(s) au total</p>
          </div>
          <Link
            to="/entreprise/products/create"
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouveau produit
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="draft">Brouillons</option>
              <option value="inactive">Inactifs</option>
              <option value="out_of_stock">Rupture de stock</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterStatus !== 'all' ? 'Aucun produit trouvé' : 'Aucun produit'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Essayez de modifier vos filtres' 
                : 'Commencez par créer votre premier produit'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                to="/entreprise/products/create"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un produit
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const statusBadge = getStatusBadge(product.status);
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                              {product.image_principale ? (
                                <img
                                  src={product.image_principale}
                                  alt={product.nom}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.nom}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.categorie_nom || 'Sans catégorie'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {parseFloat(product.prix).toFixed(2)} Ar
                          </div>
                          {product.prix_promo && (
                            <div className="text-xs text-green-600 font-semibold">
                              Promo: {parseFloat(product.prix_promo).toFixed(2)} Ar
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${
                            product.stock === 0 ? 'text-red-600' :
                            product.stock <= product.seuil_alerte_stock ? 'text-orange-600' :
                            'text-green-600'
                          }`}>
                            {product.stock}
                            {product.stock <= product.seuil_alerte_stock && product.stock > 0 && (
                              <AlertCircle className="inline w-4 h-4 ml-1" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.style}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.nombre_ventes || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/products/${product.slug}`}
                              target="_blank"
                              className="text-gray-600 hover:text-gray-900"
                              title="Voir"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            {/* ✅ CORRIGÉ : Utiliser product.slug au lieu de product.id */}
                            <Link
                              to={`/entreprise/products/${product.slug}/edit`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.slug, product.nom)}
                              disabled={deleteLoading === product.slug}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Supprimer"
                            >
                              {deleteLoading === product.slug ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}