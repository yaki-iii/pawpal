import type { Request, Response, NextFunction } from 'express';
import type { Prisma } from '@prisma/client';

// ==================== Request Types ====================

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}

// ==================== Response Types ====================

export interface UserDTO {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
  city: string;
  membershipLevel: string;
  createdAt: string;
  updatedAt: string;
}

export interface PetDTO {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed: string;
  gender: string;
  birthday: string | null;
  weight: number;
  photo: string;
  neutered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecordDTO {
  id: string;
  petId: string;
  type: string;
  date: string;
  itemName: string;
  notes: string;
  images: string[];
  createdAt: string;
}

export interface WeightRecordDTO {
  id: string;
  petId: string;
  weight: number;
  date: string;
  createdAt: string;
}

export interface ReminderDTO {
  id: string;
  petId: string;
  type: string;
  nextDate: string;
  cycleDays: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostDTO {
  id: string;
  userId: string;
  circleId: string | null;
  petId: string | null;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  author?: UserDTO;
  pet?: PetDTO | null;
  circle?: CircleDTO | null;
  isLiked?: boolean;
}

export interface CircleDTO {
  id: string;
  name: string;
  type: string;
  species: string | null;
  coverImage: string;
  description: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  isJoined?: boolean;
}

export interface CommentDTO {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author?: UserDTO;
  replies?: CommentDTO[];
}

export interface AIAssistantSessionDTO {
  id: string;
  userId: string;
  petId: string | null;
  question: string;
  imageUrls: string[];
  questionType: string;
  summary: string;
  sources: unknown[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AISource {
  type: 'post' | 'article' | 'web';
  title: string;
  url: string;
  snippet: string;
}

// ==================== Service Types ====================

export interface FeedQuery {
  type: string;
  cursor?: string;
  limit: number;
}

export interface SearchResult {
  posts: PostDTO[];
  articles: KnowledgeArticleDTO[];
}

export interface KnowledgeArticleDTO {
  id: string;
  title: string;
  species: string | null;
  breed: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  content: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

// ==================== Pagination Types ====================

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}
