import api from './api';

export const productService = {
  /**
   * Récupérer la liste des produits avec filtres optionnels
   */
  async getProducts(params = {}) {
    const response = await api.get('/products/produits/', { params });
    return response.data;
  },

  /**
   * Récupérer un produit par son slug
   */
  async getProductBySlug(slug) {
    const response = await api.get(`/products/produits/${slug}/`);
    return response.data;
  },

  /**
   * Récupérer un produit par son ID
   */
  async getProductById(id) {
    const response = await api.get(`/products/produits/${id}/`);
    return response.data;
  },

  /**
   * Récupérer les produits en vedette
   */
  async getFeaturedProducts() {
    const response = await api.get('/products/produits/vedette/');
    return response.data;
  },

  /**
   * Récupérer les produits en promotion
   */
  async getPromotionProducts() {
    const response = await api.get('/products/produits/promotions/');
    return response.data;
  },

  /**
   * Récupérer les nouveaux produits
   */
  async getNewProducts() {
    const response = await api.get('/products/produits/nouveautes/');
    return response.data;
  },

  /**
   * Récupérer les catégories
   */
  async getCategories() {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  /**
   * Récupérer une catégorie par slug
   */
  async getCategoryBySlug(slug) {
    const response = await api.get(`/products/categories/${slug}/`);
    return response.data;
  },

  /**
   * Récupérer les avis d'un produit
   */
  async getProductReviews(produitId) {
    const response = await api.get(`/products/produits/${produitId}/avis/`);
    return response.data;
  },

  /**
   * Créer un avis sur un produit (client uniquement)
   */
  async createReview(reviewData) {
    const response = await api.post('/products/avis/', reviewData);
    return response.data;
  },
};
