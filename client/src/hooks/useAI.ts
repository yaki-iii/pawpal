import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '../api/ai';
import { useUIStore } from '../store/uiStore';
import type { AIConsultPayload, SessionStatus } from '../types';

/**
 * useAI — AI assistant hook for consultation and session management.
 */
export function useAI() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  // Consult mutation
  const consultMutation = useMutation({
    mutationFn: (payload: AIConsultPayload) => aiApi.consult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] });
      showSnackbar('AI 分析完成', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || 'AI 咨询失败，请稍后重试', 'error');
    },
  });

  // List sessions
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['ai-sessions'],
    queryFn: () => aiApi.listSessions(),
    staleTime: 30 * 1000,
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: SessionStatus }) =>
      aiApi.updateSessionStatus(sessionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-sessions'] });
      showSnackbar('状态已更新', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '更新失败', 'error');
    },
  });

  return {
    consult: consultMutation.mutateAsync,
    isConsulting: consultMutation.isPending,
    currentResult: consultMutation.data,
    sessions: sessions || [],
    isLoadingSessions: isLoading,
    updateStatus: updateStatusMutation.mutateAsync,
  };
}
