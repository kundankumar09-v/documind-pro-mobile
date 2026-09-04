import { api } from './api';

export const chatService = {
  async sendMessage(question, sessionId, history) {
    return await api.post('/api/chat', {
      question,
      session_id: sessionId,
      history,
    });
  },

  streamMessage(question, sessionId, history, { onToken, onMeta, onDone, onError }) {
    return api.stream(
      '/api/chat/stream',
      { question, session_id: sessionId, history },
      onToken,
      onMeta,
      onDone,
      onError
    );
  },
};

export default chatService;
