import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import type { KnowledgeArticle } from '@prisma/client';
import type { KnowledgeArticleDTO } from '../types';
import { SearchService } from './searchService';

/**
 * KnowledgeService — knowledge article browsing, search, and batch import.
 */
export class KnowledgeService {
  /**
   * List articles with optional filters and cursor pagination.
   */
  static async list(params?: {
    species?: string;
    breed?: string;
    category?: string;
    cursor?: string;
    limit?: number;
  }): Promise<KnowledgeArticleDTO[]> {
    const where: Record<string, unknown> = {};
    if (params?.species) where.species = params.species;
    if (params?.breed) where.breed = params.breed;
    if (params?.category) where.category = params.category;
    if (params?.cursor) {
      where.createdAt = { lt: new Date(params.cursor) };
    }

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params?.limit || 20,
    });

    return articles.map(SearchService.toArticleDTO);
  }

  /**
   * Get a single article by ID.
   */
  static async getById(id: string): Promise<KnowledgeArticleDTO> {
    const article = await prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) {
      throw new Error('文章不存在');
    }
    return SearchService.toArticleDTO(article);
  }

  /**
   * Search articles by keyword.
   */
  static async search(
    keyword: string,
    filters?: { species?: string; category?: string },
  ): Promise<KnowledgeArticleDTO[]> {
    return SearchService.searchKnowledge(keyword, filters);
  }

  /**
   * Get all unique categories.
   */
  static async getCategories(): Promise<string[]> {
    const result = await prisma.knowledgeArticle.findMany({
      select: { category: true },
      distinct: ['category'],
    });
    return result.map((r) => r.category);
  }

  /**
   * Batch import articles (used by seed script and admin tools).
   */
  static async batchImport(articles: Array<{
    title: string;
    species?: string;
    breed?: string;
    category: string;
    content: string;
    author?: string;
  }>): Promise<number> {
    let count = 0;
    for (const article of articles) {
      const existing = await prisma.knowledgeArticle.findFirst({
        where: { title: article.title },
      });
      if (!existing) {
        await prisma.knowledgeArticle.create({
          data: {
            title: article.title,
            species: (article.species as 'DOG' | 'CAT') || null,
            breed: article.breed || '',
            category: article.category,
            content: article.content,
            author: article.author || 'PawPal 知识库',
          },
        });
        count++;
      }
    }
    logger.info(`Batch imported ${count} knowledge articles`);
    return count;
  }

  static toDTO(article: KnowledgeArticle): KnowledgeArticleDTO {
    return {
      id: article.id,
      title: article.title,
      species: article.species,
      breed: article.breed,
      category: article.category,
      content: article.content,
      author: article.author,
      createdAt: article.createdAt.toISOString(),
    };
  }
}
