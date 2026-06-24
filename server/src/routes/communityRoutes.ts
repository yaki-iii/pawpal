import { Router } from 'express';
import { CommunityController } from '../controllers/communityController';
import { requireAuth, optionalAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { z } from 'zod';

// Validation schemas
const postSchema = z.object({
  title: z.string().min(1, '请输入标题').max(100, '标题最多100字'),
  content: z.string().min(1, '请输入内容').max(5000, '内容最多5000字'),
  circleId: z.string().optional(),
  petId: z.string().optional(),
  images: z.array(z.string()).max(9, '最多9张图片').default([]),
  tags: z.array(z.string()).max(5, '最多5个标签').default([]),
});

const commentSchema = z.object({
  content: z.string().min(1, '请输入评论内容').max(500, '评论最多500字'),
  parentId: z.string().optional(),
});

const createCircleSchema = z.object({
  name: z.string().min(2, '圈子名称至少2个字').max(20, '圈子名称最多20个字'),
  description: z.string().max(200, '描述最多200字').default(''),
  coverImage: z.string().default(''),
});

/**
 * Post routes — mounted at /posts
 * Relative paths (no /posts prefix).
 */
export const postRoutes = Router();

// Feed — public (optional auth for like status)
postRoutes.get('/feed', optionalAuth, CommunityController.getFeed);

// Post detail — public (optional auth for like status)
postRoutes.get('/:id', optionalAuth, CommunityController.getPostById);

// Post actions — require auth
postRoutes.post('/', requireAuth, validateBody(postSchema), CommunityController.createPost);
postRoutes.delete('/:id', requireAuth, CommunityController.deletePost);
postRoutes.post('/:id/like', requireAuth, CommunityController.toggleLike);

// Comments — list is public, create/delete require auth
postRoutes.get('/:id/comments', CommunityController.listComments);
postRoutes.post('/:id/comments', requireAuth, validateBody(commentSchema), CommunityController.createComment);
postRoutes.delete('/:id/comments/:commentId', requireAuth, CommunityController.deleteComment);

/**
 * Circle routes — mounted at /circles
 * Relative paths (no /circles prefix).
 */
export const circleRoutes = Router();

// Circles — list/detail are public, join/leave require auth
circleRoutes.post('/', requireAuth, validateBody(createCircleSchema), CommunityController.createCircle);
circleRoutes.get('/', optionalAuth, CommunityController.listCircles);
circleRoutes.get('/:id', optionalAuth, CommunityController.getCircleById);
circleRoutes.get('/:id/posts', optionalAuth, CommunityController.getCirclePosts);
circleRoutes.post('/:id/join', requireAuth, CommunityController.joinCircle);
circleRoutes.post('/:id/leave', requireAuth, CommunityController.leaveCircle);

export default postRoutes;
