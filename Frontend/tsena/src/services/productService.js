import api from './api';

export const productService = {
  // Récupérer tous les produits avec filtres
  getProducts: async (params = {}) => {
    const response = await api.get('/products/produits/', { params });
    return response.data;
  },

  // Récupérer un produit par slug
  getProductBySlug: async (slug) => {
    const response = await api.get(`/products/produits/${slug}/`);
    return response.data;
  },

  // Récupérer les catégories
  getCategories: async () => {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  // Récupérer les produits en vedette
  getFeaturedProducts: async () => {
    const response = await api.get('/products/produits/', {
      params: { en_vedette: true }
    });
    return response.data;
  },

  // Récupérer les produits en promotion
  getPromotionalProducts: async () => {
    const response = await api.get('/products/produits/', {
      params: { prix_promo: true }
    });
    return response.data;
  },

  // Rechercher des produits
  searchProducts: async (query) => {
    const response = await api.get('/products/produits/', {
      params: { search: query }
    });
    return response.data;
  },

  // Récupérer les avis d'un produit
  getProductReviews: async (productId) => {
    const response = await api.get(`/products/produits/${productId}/avis/`);
    return response.data;
  },

  // Ajouter un avis
  addReview: async (reviewData) => {
    const response = await api.post('/products/avis/', reviewData);
    return response.data;
  },

  // Modifier un avis
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/products/avis/${reviewId}/`, reviewData);
    return response.data;
  },

  // Supprimer un avis
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/products/avis/${reviewId}/`);
    return response.data;
  },
};