import apiClient from './client';
import type { AIAssistantSession, AIConsultPayload, SessionStatus } from '../types';

/**
 * AI Assistant API — consult, history, status update.
 */
export const aiApi = {
  /** Submit a consultation request. Returns the full AI session with results. */
  consult(payload: AIConsultPayload): Promise<AIAssistantSession> {
    return apiClient.post('/ai/consult', payload);
  },

  /** List all AI consultation sessions for the current user. */
  listSessions(): Promise<AIAssistantSession[]> {
    return apiClient.get('/ai/sessions');
  },

  /** Get a single session by ID. */
  getSessionById(id: string): Promise<AIAssistantSession> {
    return apiClient.get(`/ai/sessions/${id}`);
  },

  /** Update the status of a session (OBSERVING, RECOVERED, VISITED_DOCTOR). */
  updateSessionStatus(id: string, status: SessionStatus): Promise<AIAssistantSession> {
    return apiClient.patch(`/ai/sessions/${id}`, { status });
  },
};
