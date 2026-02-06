// src/services/categoryService.js

import api from './api';

export const categoryService = {
  // Récupérer toutes les catégories
  getCategories: async () => {
    const response = await api.get('/products/categories/');
    return response.data;
  },

  // Récupérer une catégorie par slug
  getCategoryBySlug: async (slug) => {
    const response = await api.get(`/products/categories/${slug}/`);
    return response.data;
  },

  // Créer une catégorie
  createCategory: async (categoryData) => {
    const formData = new FormData();
    
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const response = await api.post('/products/categories/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Modifier une catégorie
  updateCategory: async (slug, categoryData) => {
    const formData = new FormData();
    
    Object.entries(categoryData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const response = await api.put(`/products/categories/${slug}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Supprimer une catégorie
  deleteCategory: async (slug) => {
    const response = await api.delete(`/products/categories/${slug}/`);
    return response.data;
  },
};

export default categoryService;