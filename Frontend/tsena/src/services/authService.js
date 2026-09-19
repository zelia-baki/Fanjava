import api from './api';

export const authService = {
  async login(username, password) {
    const response = await api.post('/users/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return response.data;
  },

  async register(userData) {
    try {
      const response = await api.post('/users/register/', userData);
      return response.data;
    } catch (error) {
      console.error('Erreur détaillée:', error.response?.data);
      throw error;
    }
  },

  async getProfile() {
    const response = await api.get('/users/profile/');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/users/profile/', data);
    return response.data;
  },

  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async requestPasswordReset(email) {
    const response = await api.post('/users/password-reset/', { email });
    return response.data;
  },

  async confirmPasswordReset(uid, token, newPassword) {
    const response = await api.post('/users/password-reset/confirm/', {
      uid,
      token,
      new_password: newPassword,
    });
    return response.data;
  },

  async verifyEmail(uid, token) {
    const response = await api.post('/users/verify-email/', { uid, token });
    return response.data;
  },

  async resendVerification() {
    const response = await api.post('/users/resend-verification/');
    return response.data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },
};