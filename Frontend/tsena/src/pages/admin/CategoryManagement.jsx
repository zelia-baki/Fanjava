import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Plus, Edit, Trash2, Loader2, Search, Tag, AlertCircle, Package } from 'lucide-react';
import api from '@/services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    active: true
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  
  // ✅ NOUVEAU: Modal pour afficher les produits bloquant la suppression
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/categories/');
      setCategories(response.data.results || response.data);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData({ nom: '', description: '', active: true });
    setEditingCategory(null);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleOpenEdit = (category) => {
    setFormData({
      nom: category.nom,
      description: category.description || '',
      active: category.active
    });
    setEditingCategory(category);
    setErrors({});
    setShowCreateModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      setErrors({ nom: 'Le nom est requis' });
      return;
    }

    try {
      setSaving(true);
      
      if (editingCategory) {
        await api.put(`/products/categories/${editingCategory.slug}/`, formData);
        alert('Catégorie mise à jour !');
      } else {
        await api.post('/products/categories/', formData);
        alert('Catégorie créée !');
      }

      setShowCreateModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } finally {
      setSaving(false);
    }
  };

  // ✅ NOUVELLE FONCTION: Voir les produits d'une catégorie
  const handleViewProducts = async (category) => {
    try {
      setLoadingProducts(true);
      setShowProductsModal(true);
      const response = await api.get(`/products/categories/${category.slug}/produits/`);
      setCategoryProducts({
        categorie: response.data.categorie,
        nombre: response.data.nombre_produits,
        produits: response.data.produits
      });
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      alert('Erreur lors du chargement des produits');
      setShowProductsModal(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Supprimer la catégorie "${category.nom}" ?`)) {
      return;
    }

    try {
      await api.delete(`/products/categories/${category.slug}/`);
      alert('Catégorie supprimée !');
      fetchCategories();
    } catch (err) {
      console.error('Erreur suppression:', err);
      
      // ✅ GESTION SPÉCIALE: Si la catégorie contient des produits
      if (err.response?.status === 400 && err.response?.data?.nombre_produits) {
        const nombreProduits = err.response.data.nombre_produits;
        
        // Afficher une alerte personnalisée
        if (window.confirm(
          `❌ Impossible de supprimer cette catégorie!\n\n` +
          `Elle contient ${nombreProduits} produit(s).\n\n` +
          `Voulez-vous voir la liste des produits?`
        )) {
          // Ouvrir le modal avec les produits
          handleViewProducts(category);
        }
      } else {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
            <p className="text-gray-600 mt-1">{categories.length} catégorie(s)</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle catégorie
          </button>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une catégorie..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* ✅ NOUVEAU: Avertissement */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 Information importante</p>
              <p>Vous ne pouvez pas supprimer une catégorie qui contient des produits. Déplacez d'abord les produits vers une autre catégorie.</p>
            </div>
          </div>
        </div>

        {/* Liste */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Tag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}
            </h3>
            {!searchQuery && (
              <button
                onClick={handleOpenCreate}
                className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer une catégorie
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Tag className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.nom}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        category.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                {/* ✅ NOUVEAU: Afficher le nombre de produits */}
                {category.nombre_produits !== undefined && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <button
                      onClick={() => handleViewProducts(category)}
                      className="flex items-center text-sm text-gray-600 hover:text-blue-600"
                    >
                      <Package className="w-4 h-4 mr-1" />
                      {category.nombre_produits} produit{category.nombre_produits > 1 ? 's' : ''}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                  <button
                    onClick={() => handleOpenEdit(category)}
                    className="text-blue-600 hover:text-blue-700 p-2"
                    title="Modifier"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-red-600 hover:text-red-700 p-2"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Création/Édition */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.nom ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Électronique"
                  />
                  {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Description de la catégorie..."
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Catégorie active
                    </span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    disabled={saving}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      editingCategory ? 'Enregistrer' : 'Créer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ✅ NOUVEAU: Modal Liste des Produits */}
        {showProductsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Produits dans "{categoryProducts.categorie}"
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {categoryProducts.nombre} produit{categoryProducts.nombre > 1 ? 's' : ''} trouvé{categoryProducts.nombre > 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loadingProducts ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categoryProducts.produits && categoryProducts.produits.map((product) => (
                      <div key={product.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
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
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{product.nom}</p>
                          <p className="text-sm text-gray-600">
                            {product.prix} Ar • Stock: {product.stock}
                          </p>
                        </div>
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          target="_blank"
                        >
                          Voir →
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-yellow-50">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Action requise</p>
                    <p>Pour supprimer cette catégorie, vous devez d'abord déplacer ou supprimer tous ces produits.</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowProductsModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}