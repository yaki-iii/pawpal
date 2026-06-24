import type { Request, Response } from 'express';
import { KnowledgeService } from '../services/knowledgeService';
import { sendSuccess, sendError } from '../middleware/error';

/**
 * KnowledgeController — handles knowledge base browsing and search.
 */
export class KnowledgeController {
  /**
   * GET /knowledge?species=DOG&breed=柯基&category=疫苗接种
   */
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const { species, breed, category, cursor, limit } = req.query;
      const articles = await KnowledgeService.list({
        species: species as string | undefined,
        breed: breed as string | undefined,
        category: category as string | undefined,
        cursor: cursor as string | undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      sendSuccess(res, articles);
    } catch (error) {
      sendError(res, 500, (error as Error).message);
    }
  }

  /**
   * GET /knowledge/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const article = await KnowledgeService.getById(req.params.id);
      sendSuccess(res, article);
    } catch (error) {
      sendError(res, 404, (error as Error).message, undefined, 404);
    }
  }

  /**
   * GET /knowledge/search?keyword=疫苗&species=DOG
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const { keyword, species, category } = req.query;
      if (!keyword) {
        sendError(res, 400, '请输入搜索关键词');
        return;
      }
      const articles = await KnowledgeService.search(keyword as string, {
        species: species as string | undefined,
        category: category as string | undefined,
      });
      sendSuccess(res, articles);
    } catch (error) {
      sendError(res, 500, (error as Error).message);
    }
  }

  /**
   * GET /knowledge/categories
   */
  static async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await KnowledgeService.getCategories();
      sendSuccess(res, categories);
    } catch (error) {
      sendError(res, 500, (error as Error).message);
    }
  }
}
