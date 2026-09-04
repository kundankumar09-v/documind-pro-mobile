import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

const TIMEOUT_MS = 30000;

async function getToken() {
  try {
    return await SecureStore.getItemAsync('dm_token');
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = await getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Don't override Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.status === 401) {
      await SecureStore.deleteItemAsync('dm_token');
      await SecureStore.deleteItemAsync('dm_user_email');
      throw new ApiError('Session expired. Please log in again.', 401);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `Request failed with status ${response.status}` };
      }
      throw new ApiError(
        errorData.detail || errorData.message || `HTTP ${response.status}`,
        response.status
      );
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your connection.', 408);
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your internet connection.', 0);
  }
}

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = {
  get: (endpoint, opts) => request(endpoint, { method: 'GET', ...opts }),
  post: (endpoint, body, opts) => request(endpoint, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (endpoint, body, opts) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  delete: (endpoint, opts) => request(endpoint, { method: 'DELETE', ...opts }),

  // FormData uploads
  upload: (endpoint, formData, opts) => request(endpoint, { method: 'POST', body: formData, ...opts }),

  // Raw fetch for SSE streaming
  stream: async (endpoint, body, onToken, onMeta, onDone, onError) => {
    const url = `${API_URL}${endpoint}`;
    const token = await getToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new ApiError(`Stream failed: HTTP ${response.status}`, response.status);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          let event;
          try { event = JSON.parse(raw); } catch { continue; }

          if (event.type === 'meta' && onMeta) {
            onMeta(event);
          } else if (event.type === 'token' && onToken) {
            onToken(event.content);
          } else if ((event.type === 'done' || event.type === 'error') && onDone) {
            onDone(event);
          }
        }
      }
    } catch (error) {
      if (onError) onError(error);
      else throw error;
    }
  },

  // Health check
  health: () => request('/health'),

  // Get base URL for images
  getImageUrl: (filename) => `${API_URL}/api/images/${encodeURIComponent(filename)}`,
};

export default api;
