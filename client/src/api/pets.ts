import apiClient from './client';
import type { Pet, PetFormData } from '../types';

/**
 * Pet API — CRUD operations for pet profiles.
 */
export const petApi = {
  /** List all pets belonging to the current user. */
  list(): Promise<Pet[]> {
    return apiClient.get('/pets');
  },

  /** Get a single pet by ID. */
  getById(id: string): Promise<Pet> {
    return apiClient.get(`/pets/${id}`);
  },

  /** Create a new pet profile. */
  create(data: PetFormData): Promise<Pet> {
    return apiClient.post('/pets', data);
  },

  /** Update an existing pet profile. */
  update(id: string, data: Partial<PetFormData>): Promise<Pet> {
    return apiClient.put(`/pets/${id}`, data);
  },

  /** Soft-delete a pet profile. */
  delete(id: string): Promise<void> {
    return apiClient.delete(`/pets/${id}`);
  },
};
