// src/pages/entreprise/CategorieForm.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '@/services/categoryService';
import { ArrowLeft, Upload, X, Save } from 'lucide-react';

const CategorieForm = () => {
  const { slug } = useParams(); // Si slug existe, c'est une modification
  const navigate = useNavigate();
  const isEdit = !!slug;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    parent: '',
    ordre: '0',
    active: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadCategory();
    }
  }, [slug]);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      const categoriesList = Array.isArray(data) ? data : data.results || [];
      setCategories(categoriesList);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const loadCategory = async () => {
    setInitialLoading(true);
    try {
      const data = await categoryService.getCategoryBySlug(slug);
      setFormData({
        nom: data.nom || '',
        description: data.description || '',
        parent: data.parent || '',
        ordre: data.ordre?.toString() || '0',
        active: data.active ?? true,
      });
      if (data.image) {
        setExistingImage(data.image);
      }
    } catch (err) {
      setError('Erreur lors du chargement de la catégorie');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom de la catégorie est requis');
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

    setLoading(true);

    try {
      const categoryData = {
        ...formData,
        image: imageFile,
      };

      if (isEdit) {
        await categoryService.updateCategory(slug, categoryData);
      } else {
        await categoryService.createCategory(categoryData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/entreprise/categories');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Erreur lors de ${isEdit ? 'la modification' : 'la création'} de la catégorie`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
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
              onClick={() => navigate('/entreprise/categories')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {isEdit ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
              </h1>
              <p className="text-sm text-gray-600">
                {isEdit ? formData.nom : 'Ajoutez une nouvelle catégorie'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Catégorie {isEdit ? 'modifiée' : 'créée'} avec succès ! Redirection...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informations principales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Informations principales
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la catégorie *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Électronique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description de la catégorie..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie parente (optionnel)
                  </label>
                  <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Aucune (catégorie principale)</option>
                    {categories
                      .filter((cat) => cat.slug !== slug) // Ne pas pouvoir se choisir comme parent
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nom}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    name="ordre"
                    value={formData.ordre}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Les catégories sont affichées par ordre croissant
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Catégorie active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Image de la catégorie
              </h2>

              <div className="space-y-4">
                {/* Image existante */}
                {existingImage && !imagePreview && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Image actuelle :</p>
                    <img
                      src={existingImage}
                      alt="Image actuelle"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Aperçu nouvelle image */}
                {imagePreview && (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600 mb-1">
                      {imagePreview || existingImage
                        ? 'Changer l\'image'
                        : 'Cliquez pour ajouter une image'}
                    </span>
                    <span className="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isEdit ? 'Modification...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {isEdit ? 'Enregistrer les modifications' : 'Créer la catégorie'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/entreprise/categories')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategorieForm;