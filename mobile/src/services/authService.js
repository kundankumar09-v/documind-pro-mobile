import { api } from './api';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'dm_token';
const EMAIL_KEY = 'dm_user_email';

export const authService = {
  async login(email, password) {
    const data = await api.post('/api/auth/login', { email, password });
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    await SecureStore.setItemAsync(EMAIL_KEY, data.email);
    return data;
  },

  async signup(email, password) {
    return await api.post('/api/auth/signup', { email, password });
  },

  async verifyOtp(email, otp) {
    return await api.post('/api/auth/verify-otp', { email, otp });
  },

  async resendOtp(email) {
    return await api.post('/api/auth/resend-otp', { email });
  },

  async forgotPassword(email) {
    return await api.post('/api/auth/forgot-password', { email });
  },

  async resetPassword(token, newPassword) {
    return await api.post('/api/auth/reset-password', { token, new_password: newPassword });
  },

  async logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(EMAIL_KEY);
  },

  async getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getUserEmail() {
    return await SecureStore.getItemAsync(EMAIL_KEY);
  },

  async isAuthenticated() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return !!token;
  },
};

export default authService;
