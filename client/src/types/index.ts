// ==================== Enums (aligned with Prisma schema) ====================

export enum PetSpecies {
  DOG = 'DOG',
  CAT = 'CAT',
}

export enum PetGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum HealthRecordType {
  VACCINE = 'VACCINE',
  DEWORMING = 'DEWORMING',
  CHECKUP = 'CHECKUP',
  VISIT = 'VISIT',
}

export enum ReminderType {
  VACCINE = 'VACCINE',
  DEWORMING = 'DEWORMING',
  CHECKUP = 'CHECKUP',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  NOTIFIED = 'NOTIFIED',
  DONE = 'DONE',
  OVERDUE = 'OVERDUE',
}

export enum NotificationType {
  REMINDER = 'REMINDER',
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  SYSTEM = 'SYSTEM',
}

export enum CircleType {
  BREED = 'BREED',
  CITY = 'CITY',
}

export enum SessionStatus {
  OBSERVING = 'OBSERVING',
  RECOVERED = 'RECOVERED',
  VISITED_DOCTOR = 'VISITED_DOCTOR',
}

export enum MembershipLevel {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export enum FeedType {
  RECOMMEND = 'RECOMMEND',
  LATEST = 'LATEST',
  FOLLOWING = 'FOLLOWING',
}

// ==================== API Response Types ====================

export interface ApiResponse<T = unknown> {
  code: number;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  items: T[];
  nextCursor: string | null;
}

// ==================== Entity Types ====================

export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  bio: string;
  city: string;
  membershipLevel: MembershipLevel;
  createdAt: string;
  updatedAt: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isFollowing?: boolean;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  birthday: string | null;
  weight: number;
  photo: string;
  neutered: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthRecordType;
  date: string;
  itemName: string;
  notes: string;
  images: string[];
  createdAt: string;
}

export interface WeightRecord {
  id: string;
  petId: string;
  weight: number;
  date: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  petId: string;
  type: ReminderType;
  nextDate: string;
  cycleDays: number;
  status: ReminderStatus;
  createdAt: string;
  updatedAt: string;
  pet?: Pet;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  content: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface Post {
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
  author?: User;
  pet?: Pet | null;
  circle?: Circle | null;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  author?: User;
  replies?: Comment[];
}

export interface Circle {
  id: string;
  name: string;
  type: CircleType;
  species: PetSpecies | null;
  coverImage: string;
  description: string;
  memberCount: number;
  postCount: number;
  createdAt: string;
  isJoined?: boolean;
}

export interface AIAssistantSession {
  id: string;
  userId: string;
  petId: string | null;
  question: string;
  imageUrls: string[];
  questionType: string;
  summary: string;
  sources: AISource[];
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AISource {
  type: 'post' | 'article' | 'web';
  title: string;
  url: string;
  snippet: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  species: PetSpecies | null;
  breed: string;
  category: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface GrowthDiary {
  id: string;
  petId: string;
  userId: string;
  milestones: GrowthMilestone[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GrowthMilestone {
  date: string;
  title: string;
  description: string;
}

// ==================== Auth Types ====================

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
}

// ==================== Form Payload Types ====================

export interface PetFormData {
  name: string;
  species: PetSpecies;
  breed: string;
  gender: PetGender;
  birthday: string;
  weight: number;
  photo: string;
  neutered: boolean;
}

export interface HealthRecordFormData {
  type: HealthRecordType;
  date: string;
  itemName: string;
  notes: string;
  images: string[];
}

export interface PostFormData {
  title: string;
  content: string;
  circleId?: string;
  petId?: string;
  images?: string[];
  tags: string[];
}

export interface AIConsultPayload {
  question: string;
  petId?: string;
  imageUrls?: string[];
}
