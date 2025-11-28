// src/pages/entreprise/ProductEdit.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '@/services/productService';
import api from '@/services/api';
import { ArrowLeft, Upload, X, Save, Trash2 } from 'lucide-react';

const ProductEdit = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [product, setProduct] = useState(null);
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
    status: 'draft',
    en_vedette: false,
    en_promotion: false,
    actif: true,
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  useEffect(() => {
    loadCategories();
    loadProduct();
  }, [slug]);

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await productService.getProductBySlug(slug);
      setProduct(data);
      
      // Pré-remplir le formulaire
      setFormData({
        nom: data.nom || '',
        description: data.description || '',
        description_courte: data.description_courte || '',
        prix: data.prix || '',
        prix_promo: data.prix_promo || '',
        stock: data.stock || '',
        seuil_alerte_stock: data.seuil_alerte_stock || '10',
        categorie: data.categorie?.id || '',
        poids: data.poids || '',
        status: data.status || 'draft',
        en_vedette: data.en_vedette || false,
        en_promotion: data.en_promotion || false,
        actif: data.actif || true,
      });

      setExistingImages(data.images || []);
    } catch (err) {
      setError('Erreur lors du chargement du produit');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + newImages.length + existingImages.length > 5) {
      alert('Vous ne pouvez avoir que 5 images maximum au total');
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom du produit est requis');
      return false;
    }
    if (!formData.description.trim()) {
      setError('La description est requise');
      return false;
    }
    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      setError('Le prix doit être supérieur à 0');
      return false;
    }
    if (formData.prix_promo && parseFloat(formData.prix_promo) >= parseFloat(formData.prix)) {
      setError('Le prix promotionnel doit être inférieur au prix normal');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('Le stock doit être supérieur ou égal à 0');
      return false;
    }
    if (formData.en_promotion && !formData.prix_promo) {
      setError('Un prix promotionnel est requis si le produit est en promotion');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Mettre à jour le produit
      const productFormData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null) {
          productFormData.append(key, value);
        }
      });

      // Ajouter les nouvelles images
      newImages.forEach((image, index) => {
        productFormData.append(`images`, image);
      });

      await api.put(`/products/produits/${slug}/`, productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Supprimer les images marquées
      for (const imageId of imagesToDelete) {
        try {
          await api.delete(`/products/images/${imageId}/`);
        } catch (err) {
          console.error('Erreur suppression image:', err);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/entreprise/products');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du produit');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          Produit introuvable
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/entreprise/products')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Modifier le Produit</h1>
              <p className="text-sm text-gray-600">{product.nom}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Produit mis à jour avec succès ! Redirection...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations principales */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations principales</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du produit *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description courte
                    </label>
                    <input
                      type="text"
                      name="description_courte"
                      value={formData.description_courte}
                      onChange={handleInputChange}
                      maxLength={500}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description_courte.length}/500 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description détaillée *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Prix et stock */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Prix et Stock</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix (Ar) *</label>
                    <input
                      type="number"
                      name="prix"
                      value={formData.prix}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix promotionnel (Ar)
                    </label>
                    <input
                      type="number"
                      name="prix_promo"
                      value={formData.prix_promo}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seuil d'alerte stock
                    </label>
                    <input
                      type="number"
                      name="seuil_alerte_stock"
                      value={formData.seuil_alerte_stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Images du produit</h2>

                <div className="space-y-4">
                  {/* Images existantes */}
                  {existingImages.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Images actuelles</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image}
                              alt={image.alt_text}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => markImageForDeletion(image.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            {image.est_principale && (
                              <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                Principale
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zone d'upload pour nouvelles images */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Ajouter des images</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="newImages"
                        multiple
                        accept="image/*"
                        onChange={handleNewImageChange}
                        className="hidden"
                      />
                      <label htmlFor="newImages" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <span className="text-sm text-gray-600 mb-1">
                          Cliquez pour ajouter des images
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 10MB (max 5 images au total)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Aperçus des nouvelles images */}
                  {newImagePreviews.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Nouvelles images</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {newImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Nouvelle ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colonne latérale */}
            <div className="space-y-6">
              {/* Catégorie */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Catégorie</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Caractéristiques</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Poids (kg)</label>
                  <input
                    type="number"
                    name="poids"
                    value={formData.poids}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Statut et visibilité */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Statut et Visibilité</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="actif"
                        checked={formData.actif}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Produit actif</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="en_vedette"
                        checked={formData.en_vedette}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Produit en vedette</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="en_promotion"
                        checked={formData.en_promotion}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Produit en promotion</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/entreprise/products')}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEdit;