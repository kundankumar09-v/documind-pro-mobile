import { api } from './api';

export const documentService = {
  async uploadDocument(file, sessionId) {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/octet-stream',
    });
    formData.append('session_id', sessionId);

    return await api.upload('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },

  async deleteSessionVectors(sessionId) {
    try {
      await api.delete(`/api/session/${sessionId}`);
    } catch {
      // Silently fail — session cleanup is best-effort
    }
  },

  async checkModelHealth() {
    return await api.get('/api/health/model');
  },

  async healthCheck() {
    return await api.get('/health');
  },
};

export default documentService;
