import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import type { PostDTO, KnowledgeArticleDTO, SearchResult } from '../types';
import { CommunityService } from './communityService';
import { AuthService } from './authService';
import { PetService } from './petService';

/**
 * SearchService — full-text search across community posts and knowledge articles.
 * Uses PostgreSQL ILIKE for MVP (pg_trgm can be added later for better fuzzy matching).
 */
export class SearchService {
  /**
   * Search community posts by keyword.
   * Matches against title and content fields.
   */
  static async searchPosts(keyword: string, limit: number = 10): Promise<PostDTO[]> {
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { author: true, pet: true, circle: true },
    });

    return posts.map((p) => {
      const dto = CommunityService.toPostDTO(p);
      if (p.author) dto.author = AuthService.toDTO(p.author as never);
      if (p.pet) dto.pet = PetService.toDTO(p.pet as never);
      if (p.circle) dto.circle = CommunityService.toCircleDTO(p.circle as never);
      return dto;
    });
  }

  /**
   * Search knowledge articles by keyword.
   * Matches against title and content fields.
   */
  static async searchKnowledge(
    keyword: string,
    filters?: { species?: string; category?: string },
    limit: number = 10,
  ): Promise<KnowledgeArticleDTO[]> {
    const where: Record<string, unknown> = {
      OR: [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ],
    };
    if (filters?.species) where.species = filters.species;
    if (filters?.category) where.category = filters.category;

    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return articles.map(SearchService.toArticleDTO);
  }

  /**
   * Search across all content types (posts + articles).
   * Used by AI assistant pipeline.
   */
  static async searchAll(keyword: string, limit: number = 5): Promise<SearchResult> {
    const [posts, articles] = await Promise.all([
      SearchService.searchPosts(keyword, limit),
      SearchService.searchKnowledge(keyword, undefined, limit),
    ]);

    logger.info(`Search "${keyword}": ${posts.length} posts, ${articles.length} articles`);
    return { posts, articles };
  }

  static toArticleDTO(article: {
    id: string;
    title: string;
    species: string | null;
    breed: string;
    category: string;
    content: string;
    author: string;
    createdAt: Date;
  }): KnowledgeArticleDTO {
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
