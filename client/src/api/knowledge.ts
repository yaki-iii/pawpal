import apiClient from './client';
import type { KnowledgeArticle } from '../types';

/**
 * Knowledge Base API — browse and search articles.
 */
export const knowledgeApi = {
  /** List articles with optional filters (species, breed, category). */
  list(params?: {
    species?: string;
    breed?: string;
    category?: string;
    cursor?: string;
    limit?: number;
  }): Promise<KnowledgeArticle[]> {
    return apiClient.get('/knowledge', { params });
  },

  /** Search articles by keyword. */
  search(keyword: string, filters?: { species?: string; category?: string }): Promise<KnowledgeArticle[]> {
    const params: Record<string, unknown> = { keyword };
    if (filters?.species) params.species = filters.species;
    if (filters?.category) params.category = filters.category;
    return apiClient.get('/knowledge/search', { params });
  },

  /** Get a single article by ID. */
  getById(id: string): Promise<KnowledgeArticle> {
    return apiClient.get(`/knowledge/${id}`);
  },

  /** Get all unique categories. */
  getCategories(): Promise<string[]> {
    return apiClient.get('/knowledge/categories');
  },
};
