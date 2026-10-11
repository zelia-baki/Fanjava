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
    // Récupérer le panier depuis localStorage
    const cartString = localStorage.getItem('cart');
    console.log('🛒 Cart brut localStorage:', cartString);
    
    const cartData = JSON.parse(cartString || '{"items": []}');
    console.log('🛒 Cart parsé:', cartData);
    
    // Extraire les items du panier
    const cartItems = cartData.items || [];
    console.log('📦 Cart items:', cartItems);
    
    // Transformer les items en format attendu par Django
    const items = cartItems.map(item => {
      console.log('📦 Item original:', item);
      const formatted = {
        produit_id: item.produit?.id || item.id,
        quantite: item.quantite || item.quantity || 1
      };
      console.log('✅ Item formaté:', formatted);
      return formatted;
    });
    
    console.log('✅ Tous les items formatés:', items);
    
    // Ajouter les items aux données de commande
    const dataWithItems = {
      ...orderData,
      items: items
    };
    
    console.log('📤 Données complètes envoyées à Django:', dataWithItems);
    
    try {
      const response = await api.post('/orders/commandes/create_from_cart/', dataWithItems);
      console.log('✅ Réponse Django:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur Django:', error.response?.data);
      throw error;
    }
  },

  /**
   * Récupérer toutes les commandes de l'utilisateur
   */
  async getOrders(params = {}) {
    const response = await api.get('/orders/commandes/', { params });
    return response.data;
  },

  /** Annuler une commande (client, tant qu'elle n'est pas en préparation) */
  async cancelOrder(id) {
    const response = await api.post(`/orders/commandes/${id}/cancel/`);
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