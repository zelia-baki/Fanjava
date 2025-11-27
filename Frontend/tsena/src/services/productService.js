import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products/produits/', { params });
    return response.data;
  },

  async getProductBySlug(slug) {
    const response = await api.get(`/products/produits/${slug}/`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  async createProduct(formData) {
    const response = await api.post('/products/produits/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateProduct(id, formData) {
    const response = await api.put(`/products/produits/${id}/update/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteProduct(id) {
    await api.delete(`/products/produits/${id}/delete/`);
  },

  async createAvis(avisData) {
    const response = await api.post('/products/avis/create/', avisData);
    return response.data;
  },
};