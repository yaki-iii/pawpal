import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petApi } from '../api/pets';
import { healthApi } from '../api/health';
import { usePetStore } from '../store/petStore';
import { useUIStore } from '../store/uiStore';
import type { PetFormData, HealthRecordFormData } from '../types';

/**
 * usePets — pet data management with React Query.
 * Provides list, create, update, delete operations with cache invalidation.
 */
export function usePets() {
  const queryClient = useQueryClient();
  const { pets, currentPet, setPets, setCurrentPet, addPet, updatePet, removePet } = usePetStore();
  const { showSnackbar } = useUIStore();

  // Query: fetch all pets
  const { data, isLoading, error } = useQuery({
    queryKey: ['pets'],
    queryFn: async () => {
      const result = await petApi.list();
      setPets(result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation: create pet
  const createPetMutation = useMutation({
    mutationFn: (data: PetFormData) => petApi.create(data),
    onSuccess: (pet) => {
      addPet(pet);
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      showSnackbar('宠物档案创建成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '创建失败', 'error');
    },
  });

  // Mutation: update pet
  const updatePetMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PetFormData> }) => petApi.update(id, data),
    onSuccess: (pet) => {
      updatePet(pet);
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      queryClient.invalidateQueries({ queryKey: ['pet', pet.id] });
      showSnackbar('宠物档案更新成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '更新失败', 'error');
    },
  });

  // Mutation: delete pet
  const deletePetMutation = useMutation({
    mutationFn: (id: string) => petApi.delete(id),
    onSuccess: (_, id) => {
      removePet(id);
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      showSnackbar('宠物档案已删除', 'info');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '删除失败', 'error');
    },
  });

  return {
    pets: data || pets,
    currentPet,
    isLoading,
    error,
    setCurrentPet,
    createPet: createPetMutation.mutateAsync,
    updatePet: updatePetMutation.mutateAsync,
    deletePet: deletePetMutation.mutateAsync,
    isCreating: createPetMutation.isPending,
    isUpdating: updatePetMutation.isPending,
    isDeleting: deletePetMutation.isPending,
  };
}

/**
 * useHealthRecords — health records for a specific pet.
 */
export function useHealthRecords(petId: string | undefined) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  const { data, isLoading } = useQuery({
    queryKey: ['health-records', petId],
    queryFn: () => healthApi.listHealthRecords(petId!),
    enabled: !!petId,
  });

  const createMutation = useMutation({
    mutationFn: (data: HealthRecordFormData) => healthApi.createHealthRecord(petId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', petId] });
      queryClient.invalidateQueries({ queryKey: ['reminders', petId] });
      showSnackbar('健康记录已添加', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '添加失败', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (recordId: string) => healthApi.deleteHealthRecord(petId!, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-records', petId] });
      showSnackbar('记录已删除', 'info');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '删除失败', 'error');
    },
  });

  return {
    records: data || [],
    isLoading,
    createRecord: createMutation.mutateAsync,
    deleteRecord: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}

/**
 * useWeightRecords — weight records for a specific pet.
 */
export function useWeightRecords(petId: string | undefined) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  const { data, isLoading } = useQuery({
    queryKey: ['weight-records', petId],
    queryFn: () => healthApi.listWeightRecords(petId!),
    enabled: !!petId,
  });

  const createMutation = useMutation({
    mutationFn: ({ weight, date }: { weight: number; date: string }) =>
      healthApi.createWeightRecord(petId!, weight, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weight-records', petId] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      showSnackbar('体重记录已添加', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '添加失败', 'error');
    },
  });

  return {
    weightRecords: data || [],
    isLoading,
    addWeight: createMutation.mutateAsync,
    isAdding: createMutation.isPending,
  };
}

/**
 * useReminders — reminders for a specific pet or all pets.
 */
export function useReminders(petId?: string) {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  const queryKey = petId ? ['reminders', petId] : ['reminders', 'all'];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => (petId ? healthApi.listReminders(petId) : healthApi.listAllReminders()),
  });

  const markDoneMutation = useMutation({
    mutationFn: (reminderId: string) => healthApi.markReminderDone(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      showSnackbar('提醒已标记完成', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '操作失败', 'error');
    },
  });

  const updateCycleMutation = useMutation({
    mutationFn: ({ reminderId, cycleDays }: { reminderId: string; cycleDays: number }) =>
      healthApi.updateReminderCycle(reminderId, cycleDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      showSnackbar('提醒周期已更新', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '更新失败', 'error');
    },
  });

  return {
    reminders: data || [],
    isLoading,
    markDone: markDoneMutation.mutateAsync,
    updateCycle: updateCycleMutation.mutateAsync,
  };
}
