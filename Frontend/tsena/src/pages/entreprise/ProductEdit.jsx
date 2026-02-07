import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { ArrowLeft, Upload, X, Loader2, Save } from 'lucide-react';
import api from '@/services/api';

export default function ProductEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    description_courte: '',
    prix: '',
    prix_promo: '',
    stock: '',
    seuil_alerte_stock: '10',
    categorie: '',
    poids: '',
    en_vedette: false,
    en_promotion: false,
    actif: true,
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productRes, categoriesRes] = await Promise.all([
        api.get(`/products/produits/${slug}/`),
        api.get('/products/categories/')
      ]);

      const product = productRes.data;
      setFormData({
        nom: product.nom || '',
        description: product.description || '',
        description_courte: product.description_courte || '',
        prix: product.prix || '',
        prix_promo: product.prix_promo || '',
        stock: product.stock || '',
        seuil_alerte_stock: product.seuil_alerte_stock || '10',
        categorie: product.categorie?.id || product.categorie || '',
        poids: product.poids || '',
        en_vedette: product.en_vedette || false,
        en_promotion: product.en_promotion || false,
        actif: product.actif !== undefined ? product.actif : true,
        status: product.status || 'active'
      });

      setExistingImages(product.images || []);
      setCategories(categoriesRes.data.results || categoriesRes.data);
    } catch (err) {
      console.error('Erreur chargement produit:', err);
      alert('Erreur lors du chargement du produit');
      navigate('/entreprise/products');
    } finally {
      setLoading(false);
    }
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

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId) => {
    if (!window.confirm('Supprimer cette image ?')) return;

    try {
      await api.delete(`/products/produits/${slug}/supprimer_image/`, {
        data: { image_id: imageId }
      });
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      alert('Image supprimée');
    } catch (err) {
      console.error('Erreur suppression image:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0';
    }
    if (formData.prix_promo && parseFloat(formData.prix_promo) >= parseFloat(formData.prix)) {
      newErrors.prix_promo = 'Le prix promo doit être inférieur au prix normal';
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Le stock doit être >= 0';
    }
    if (!formData.categorie) newErrors.categorie = 'La catégorie est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSaving(true);

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      newImages.forEach((image, index) => {
        formDataToSend.append(`image_${index}`, image);
      });

      await api.put(`/products/produits/${slug}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Produit mis à jour avec succès !');
      navigate('/entreprise/products');
    } catch (err) {
      console.error('Erreur mise à jour produit:', err);
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        alert('Erreur lors de la mise à jour du produit');
      }
    } finally {
      setSaving(false);
    }
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

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-orange-600 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm">Retour</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Modifier le produit</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations principales */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Informations principales</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.nom ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description courte
                  </label>
                  <input
                    type="text"
                    name="description_courte"
                    value={formData.description_courte}
                    onChange={handleChange}
                    maxLength={200}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    {formData.description_courte.length}/200 caractères
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none ${
                      errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.categorie ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nom}</option>
                    ))}
                  </select>
                  {errors.categorie && <p className="mt-1 text-sm text-red-600">{errors.categorie}</p>}
                </div>
              </div>
            </div>

            {/* Prix et stock */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Prix et stock</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (Ar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.prix ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.prix && <p className="mt-1 text-sm text-red-600">{errors.prix}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix promotionnel (Ar)
                  </label>
                  <input
                    type="number"
                    name="prix_promo"
                    value={formData.prix_promo}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.prix_promo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.prix_promo && (
                    <p className="mt-1 text-sm text-red-600">{errors.prix_promo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                      errors.stock ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d'alerte stock
                  </label>
                  <input
                    type="number"
                    name="seuil_alerte_stock"
                    value={formData.seuil_alerte_stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    name="poids"
                    value={formData.poids}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  >
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                    <option value="inactive">Inactif</option>
                    <option value="out_of_stock">Rupture de stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Images existantes */}
            {existingImages.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Images existantes</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.image}
                        alt={image.alt_text || 'Image produit'}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          Principale
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ajouter nouvelles images */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Ajouter des images</h2>

              <div className="mb-4">
                <label className="flex items-center justify-center w-full h-32 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Ajouter des images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 10MB</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {newImagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Nouveau ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Nouvelle
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Options</h2>

              <div className="space-y-3">
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    name="en_vedette"
                    checked={formData.en_vedette}
                    onChange={handleChange}
                    className="w-4 h-4 mt-0.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Produit en vedette</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="en_promotion"
                    checked={formData.en_promotion}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">En promotion</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleChange}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Produit actif</span>
                </label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={saving}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center font-medium transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
