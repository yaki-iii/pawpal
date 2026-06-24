import apiClient from './client';
import type { GrowthDiaryEntry } from '../types';

/**
 * Growth diary API — daily diary entries with photo/video support.
 * Endpoints mounted at /pets/:petId/entries
 */
export const growthDiaryApi = {
  /** List all diary entries for a pet, newest first. */
  listEntries(petId: string): Promise<GrowthDiaryEntry[]> {
    return apiClient.get(`/pets/${petId}/entries`);
  },

  /** Create a new diary entry with optional media uploads (multipart/form-data). */
  createEntry(petId: string, data: FormData): Promise<GrowthDiaryEntry> {
    return apiClient.post(`/pets/${petId}/entries`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** Delete a diary entry by ID. */
  deleteEntry(petId: string, entryId: string): Promise<void> {
    return apiClient.delete(`/pets/${petId}/entries/${entryId}`);
  },
};

export type { GrowthDiaryEntry };
