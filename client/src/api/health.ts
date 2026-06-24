import apiClient from './client';
import type {
  HealthRecord,
  HealthRecordFormData,
  WeightRecord,
  Reminder,
  PaginatedData,
} from '../types';

/**
 * Health API — health records, weight records, and reminders.
 */
export const healthApi = {
  // ---- Health Records ----

  /** List health records for a pet, optionally filtered by type. */
  listHealthRecords(petId: string, type?: string): Promise<HealthRecord[]> {
    const params = type ? { type } : {};
    return apiClient.get(`/pets/${petId}/health-records`, { params });
  },

  /** Create a new health record. */
  createHealthRecord(petId: string, data: HealthRecordFormData): Promise<HealthRecord> {
    return apiClient.post(`/pets/${petId}/health-records`, data);
  },

  /** Update a health record. */
  updateHealthRecord(petId: string, recordId: string, data: Partial<HealthRecordFormData>): Promise<HealthRecord> {
    return apiClient.put(`/pets/${petId}/health-records/${recordId}`, data);
  },

  /** Delete a health record. */
  deleteHealthRecord(petId: string, recordId: string): Promise<void> {
    return apiClient.delete(`/pets/${petId}/health-records/${recordId}`);
  },

  // ---- Weight Records ----

  /** List weight records for a pet. */
  listWeightRecords(petId: string): Promise<WeightRecord[]> {
    return apiClient.get(`/pets/${petId}/weight-records`);
  },

  /** Record a new weight measurement. */
  createWeightRecord(petId: string, weight: number, date: string): Promise<WeightRecord> {
    return apiClient.post(`/pets/${petId}/weight-records`, { weight, date });
  },

  /** Delete a weight record. */
  deleteWeightRecord(petId: string, recordId: string): Promise<void> {
    return apiClient.delete(`/pets/${petId}/weight-records/${recordId}`);
  },

  // ---- Reminders ----

  /** List all reminders for a pet. */
  listReminders(petId: string): Promise<Reminder[]> {
    return apiClient.get(`/pets/${petId}/reminders`);
  },

  /** List all reminders for the current user (across all pets). */
  listAllReminders(): Promise<Reminder[]> {
    return apiClient.get('/reminders');
  },

  /** Mark a reminder as done. */
  markReminderDone(reminderId: string): Promise<Reminder> {
    return apiClient.patch(`/reminders/${reminderId}/done`);
  },

  /** Update reminder cycle days. */
  updateReminderCycle(reminderId: string, cycleDays: number): Promise<Reminder> {
    return apiClient.patch(`/reminders/${reminderId}`, { cycleDays });
  },
};
