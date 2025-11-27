import api from './api';

export const orderService = {
  async createOrder(orderData) {
    const response = await api.post('/orders/commandes/create/', orderData);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/orders/commandes/');
    return response.data;
  },

  async getOrderDetail(id) {
    const response = await api.get(`/orders/commandes/${id}/`);
    return response.data;
  },
};