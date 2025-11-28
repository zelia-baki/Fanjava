import api from './api';

export const orderService = {
  // ========== PANIER ==========
  
  /**
   * Récupérer le panier de l'utilisateur connecté
   */
  async getCart() {
    const response = await api.get('/orders/panier/');
    return response.data;
  },

  /**
   * Ajouter un produit au panier
   */
  async addToCart(produitId, quantite = 1) {
    const response = await api.post('/orders/panier/add_item/', {
      produit_id: produitId,
      quantite: quantite,
    });
    return response.data;
  },

  /**
   * Mettre à jour la quantité d'un item dans le panier
   */
  async updateCartItem(itemId, quantite) {
    const response = await api.patch('/orders/panier/update_item/', {
      item_id: itemId,
      quantite: quantite,
    });
    return response.data;
  },

  /**
   * Supprimer un item du panier
   */
  async removeFromCart(itemId) {
    const response = await api.delete('/orders/panier/remove_item/', {
      data: { item_id: itemId },
    });
    return response.data;
  },

  /**
   * Vider complètement le panier
   */
  async clearCart() {
    const response = await api.delete('/orders/panier/clear/');
    return response.data;
  },

  // ========== COMMANDES ==========

  /**
   * Créer une commande depuis le panier
   */
  async createOrderFromCart(orderData) {
    const response = await api.post('/orders/commandes/create_from_cart/', orderData);
    return response.data;
  },

  /**
   * Récupérer toutes les commandes de l'utilisateur
   */
  async getOrders() {
    const response = await api.get('/orders/commandes/');
    return response.data;
  },

  /**
   * Récupérer les détails d'une commande
   */
  async getOrderDetail(id) {
    const response = await api.get(`/orders/commandes/${id}/`);
    return response.data;
  },
};