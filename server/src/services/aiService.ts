import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { llmClient } from './llmClient';
import { SearchService } from './searchService';
import type { AIAssistantSessionDTO, AISource } from '../types';
import type { AIAssistantSession } from '@prisma/client';

/**
 * System prompt for the AI assistant.
 * CRITICAL: This prompt is hardcoded in the backend and cannot be modified by the frontend.
 * The AI must NOT provide medical diagnosis or medication dosages.
 */
const SYSTEM_PROMPT = `你是 PawPal 爪友的宠物经验总结助手。你的职责是：

1. 根据用户的问题描述，总结社区经验和知识要点
2. 提供参考建议，但绝不进行医疗诊断
3. 不给出具体用药剂量
4. 不替代兽医的专业建议
5. 如果问题涉及紧急情况（如大量出血、呼吸困难、严重外伤），建议用户立即就医
6. 总结内容要分条列出，语言简洁明了
7. 引用社区帖子和知识文章时，注明来源

请始终记住：你是经验总结助手，不是兽医。所有建议仅供参考。`;

/**
 * Question type categories for classification.
 */
const QUESTION_CATEGORIES = [
  '消化问题', '皮肤问题', '行为异常', '眼部问题', '耳部问题',
  '口腔问题', '呼吸道问题', '泌尿问题', '骨科问题', '营养饮食', '其他',
];

/**
 * Fixed disclaimer text — appended to every AI response.
 */
const DISCLAIMER = '以上内容来自社区和公开信息总结，仅供参考，不构成医疗诊断，复杂情况请及时就医。';

/**
 * AIService — orchestrates the AI consultation pipeline:
 * 1. Identify question type (LLM classification)
 * 2. Search content (community posts + knowledge articles)
 * 3. Summarize (LLM summarization)
 * 4. Assemble result + disclaimer
 */
export class AIService {
  /**
   * Run the full AI consultation pipeline.
   * @throws Error if pipeline fails at any step.
   */
  static async runPipeline(data: {
    userId: string;
    question: string;
    petId?: string;
    imageUrls?: string[];
  }): Promise<AIAssistantSessionDTO> {
    const { userId, question, petId, imageUrls = [] } = data;
    logger.info(`AI pipeline started for user ${userId}, question: ${question.substring(0, 50)}...`);

    // Step 1: Identify question type
    let questionType = '其他';
    if (llmClient.isConfigured()) {
      try {
        questionType = await llmClient.classify(question, QUESTION_CATEGORIES);
        logger.info(`AI question type: ${questionType}`);
      } catch (error) {
        logger.warn(`Question type classification failed, using default: ${(error as Error).message}`);
      }
    }

    // Step 2: Search content (community posts + knowledge articles)
    const searchKeyword = `${question} ${questionType}`;
    const searchResults = await SearchService.searchAll(searchKeyword, 5);
    logger.info(`AI search results: ${searchResults.posts.length} posts, ${searchResults.articles.length} articles`);

    // Build sources array for the response
    const sources: AISource[] = [
      ...searchResults.posts.map((post) => ({
        type: 'post' as const,
        title: post.title,
        url: `/posts/${post.id}`,
        snippet: post.content.substring(0, 100),
      })),
      ...searchResults.articles.map((article) => ({
        type: 'article' as const,
        title: article.title,
        url: `/knowledge/${article.id}`,
        snippet: article.content.substring(0, 100),
      })),
    ];

    // Step 3: Summarize (LLM summarization)
    let summary = '';
    if (llmClient.isConfigured()) {
      try {
        const contextText = AIService.buildContextText(question, searchResults.posts, searchResults.articles);
        const messages: Array<{ role: 'system' | 'user'; content: string }> = [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contextText },
        ];
        summary = await llmClient.chat(messages, { temperature: 0.7, maxTokens: 800 });
        logger.info('AI summary generated successfully');
      } catch (error) {
        logger.warn(`AI summary failed, using fallback: ${(error as Error).message}`);
        summary = AIService.buildFallbackSummary(searchResults.posts, searchResults.articles);
      }
    } else {
      // LLM not configured — use fallback summary from search results
      summary = AIService.buildFallbackSummary(searchResults.posts, searchResults.articles);
    }

    // Step 4: Assemble result + disclaimer
    const session = await prisma.aIAssistantSession.create({
      data: {
        userId,
        petId: petId || null,
        question,
        imageUrls,
        questionType,
        summary: summary + '\n\n⚠️ ' + DISCLAIMER,
        sources: sources as unknown as Record<string, unknown>[],
      },
    });

    logger.info(`AI pipeline completed: session ${session.id}`);
    return AIService.toDTO(session);
  }

  /**
   * Build context text for the LLM from search results.
   */
  static buildContextText(
    question: string,
    posts: Array<{ title: string; content: string }>,
    articles: Array<{ title: string; content: string }>,
  ): string {
    let context = `用户问题：${question}\n\n`;

    if (posts.length > 0) {
      context += '相关社区帖子：\n';
      posts.forEach((post, i) => {
        context += `${i + 1}. ${post.title}\n${post.content.substring(0, 200)}\n\n`;
      });
    }

    if (articles.length > 0) {
      context += '相关知识文章：\n';
      articles.forEach((article, i) => {
        context += `${i + 1}. ${article.title}\n${article.content.substring(0, 200)}\n\n`;
      });
    }

    context += '请根据以上信息，总结归纳参考建议（不要做医疗诊断，不要给出用药剂量）：';
    return context;
  }

  /**
   * Build fallback summary when LLM is unavailable.
   * Returns a formatted summary of search results.
   */
  static buildFallbackSummary(
    posts: Array<{ title: string; content: string }>,
    articles: Array<{ title: string; content: string }>,
  ): string {
    let summary = '根据社区和知识库搜索结果，为您整理以下参考信息：\n\n';

    if (posts.length > 0) {
      summary += '📋 社区相关讨论：\n';
      posts.forEach((post, i) => {
        summary += `${i + 1}. ${post.title}\n`;
      });
      summary += '\n';
    }

    if (articles.length > 0) {
      summary += '📚 相关知识文章：\n';
      articles.forEach((article, i) => {
        summary += `${i + 1}. ${article.title}\n`;
      });
      summary += '\n';
    }

    if (posts.length === 0 && articles.length === 0) {
      summary += '暂未找到与您问题直接相关的内容。建议您在社区发布求助帖，获取更多宠主的经验分享。\n';
    }

    return summary;
  }

  /**
   * Build the fixed disclaimer text.
   */
  static buildDisclaimer(): string {
    return DISCLAIMER;
  }

  /**
   * List all AI sessions for a user.
   */
  static async listByUser(userId: string): Promise<AIAssistantSessionDTO[]> {
    const sessions = await prisma.aIAssistantSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map(AIService.toDTO);
  }

  /**
   * Get a single AI session by ID.
   */
  static async getById(id: string, userId: string): Promise<AIAssistantSessionDTO> {
    const session = await prisma.aIAssistantSession.findUnique({ where: { id } });
    if (!session) {
      throw new Error('咨询记录不存在');
    }
    if (session.userId !== userId) {
      throw new Error('无权访问该记录');
    }
    return AIService.toDTO(session);
  }

  /**
   * Update the status of an AI session.
   */
  static async updateStatus(id: string, userId: string, status: string): Promise<AIAssistantSessionDTO> {
    const existing = await prisma.aIAssistantSession.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('咨询记录不存在');
    }
    if (existing.userId !== userId) {
      throw new Error('无权修改该记录');
    }

    const session = await prisma.aIAssistantSession.update({
      where: { id },
      data: { status: status as 'OBSERVING' | 'RECOVERED' | 'VISITED_DOCTOR' },
    });

    return AIService.toDTO(session);
  }

  /**
   * Convert a Prisma AIAssistantSession to a DTO.
   */
  static toDTO(session: AIAssistantSession): AIAssistantSessionDTO {
    return {
      id: session.id,
      userId: session.userId,
      petId: session.petId,
      question: session.question,
      imageUrls: session.imageUrls,
      questionType: session.questionType,
      summary: session.summary,
      sources: session.sources as unknown[],
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  }
}
