import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { growthDiaryApi } from '../api/growthDiary';
import { useUIStore } from '../store/uiStore';

/**
 * useGrowthDiaryEntries — query all diary entries for a pet.
 * Disabled when petId is undefined.
 */
export function useGrowthDiaryEntries(petId: string | undefined) {
  return useQuery({
    queryKey: ['growthDiaryEntries', petId],
    queryFn: () => growthDiaryApi.listEntries(petId!),
    enabled: !!petId,
  });
}

/**
 * useCreateGrowthDiaryEntry — create a new diary entry with FormData.
 * Invalidates the entries list on success and shows a snackbar.
 */
export function useCreateGrowthDiaryEntry(petId: string | undefined) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  return useMutation({
    mutationFn: (data: FormData) => growthDiaryApi.createEntry(petId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growthDiaryEntries', petId] });
      showSnackbar('记录成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '记录失败', 'error');
    },
  });
}

/**
 * useDeleteGrowthDiaryEntry — delete a diary entry by ID.
 * Invalidates the entries list on success and shows a snackbar.
 */
export function useDeleteGrowthDiaryEntry(petId: string | undefined) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  return useMutation({
    mutationFn: (entryId: string) => growthDiaryApi.deleteEntry(petId!, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growthDiaryEntries', petId] });
      showSnackbar('删除成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '删除失败', 'error');
    },
  });
}

/**
 * useGrowthDiary — combined hook for growth diary entries.
 * Provides a clean function-style API for create and delete operations.
 */
export function useGrowthDiary(petId: string | undefined) {
  const entriesQuery = useGrowthDiaryEntries(petId);
  const createMutation = useCreateGrowthDiaryEntry(petId);
  const deleteMutation = useDeleteGrowthDiaryEntry(petId);

  /**
   * Create a new diary entry. Converts the data to FormData internally.
   */
  const createEntry = async (data: {
    title: string;
    content: string;
    mood: string;
    files: File[];
  }): Promise<void> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('mood', data.mood);
    data.files.forEach((file) => formData.append('media', file));
    await createMutation.mutateAsync(formData);
  };

  /**
   * Delete a diary entry by ID.
   */
  const deleteEntry = async (entryId: string): Promise<void> => {
    await deleteMutation.mutateAsync(entryId);
  };

  return {
    entries: entriesQuery.data ?? [],
    isLoading: entriesQuery.isLoading,
    createEntry,
    isCreating: createMutation.isPending,
    deleteEntry,
  };
}
