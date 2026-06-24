import apiClient from './client';
import type {
  Post,
  PostFormData,
  Comment,
  Circle,
  Notification,
  User,
  FeedType,
  PaginatedData,
} from '../types';

/**
 * Community API — posts, feed, circles, comments, likes, follows.
 */
export const communityApi = {
  // ---- Feed ----

  /** Get feed posts with cursor-based pagination. */
  getFeed(type: FeedType, cursor?: string, limit: number = 10): Promise<PaginatedData<Post>> {
    const params: Record<string, unknown> = { type, limit };
    if (cursor) params.cursor = cursor;
    return apiClient.get('/posts/feed', { params });
  },

  /** Get posts by circle ID. */
  getCirclePosts(circleId: string, cursor?: string, limit: number = 10): Promise<PaginatedData<Post>> {
    const params: Record<string, unknown> = { limit };
    if (cursor) params.cursor = cursor;
    return apiClient.get(`/circles/${circleId}/posts`, { params });
  },

  /** Get posts by user ID. */
  getUserPosts(userId: string, cursor?: string, limit: number = 10): Promise<PaginatedData<Post>> {
    const params: Record<string, unknown> = { limit };
    if (cursor) params.cursor = cursor;
    return apiClient.get(`/users/${userId}/posts`, { params });
  },

  // ---- Posts ----

  /** Get a single post by ID (with author, pet, circle info). */
  getPostById(id: string): Promise<Post> {
    return apiClient.get(`/posts/${id}`);
  },

  /** Create a new post. */
  createPost(data: PostFormData): Promise<Post> {
    return apiClient.post('/posts', data);
  },

  /** Delete a post. */
  deletePost(id: string): Promise<void> {
    return apiClient.delete(`/posts/${id}`);
  },

  // ---- Likes ----

  /** Toggle like on a post. Returns { liked: boolean }. */
  toggleLike(postId: string): Promise<{ liked: boolean }> {
    return apiClient.post(`/posts/${postId}/like`);
  },

  // ---- Comments ----

  /** List comments for a post (with nested replies). */
  listComments(postId: string): Promise<Comment[]> {
    return apiClient.get(`/posts/${postId}/comments`);
  },

  /** Create a comment (optionally a reply via parentId). */
  createComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const data: Record<string, unknown> = { content };
    if (parentId) data.parentId = parentId;
    return apiClient.post(`/posts/${postId}/comments`, data);
  },

  /** Delete a comment. */
  deleteComment(postId: string, commentId: string): Promise<void> {
    return apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },

  // ---- Circles ----

  /** List circles, optionally filtered by type/species. */
  listCircles(params?: { type?: string; species?: string; keyword?: string }): Promise<Circle[]> {
    return apiClient.get('/circles', { params });
  },

  /** Create a new topic circle (user-created). */
  createCircle(data: { name: string; description?: string; coverImage?: string }): Promise<Circle> {
    return apiClient.post('/circles', data);
  },

  /** Get circle detail by ID. */
  getCircleById(id: string): Promise<Circle> {
    return apiClient.get(`/circles/${id}`);
  },

  /** Join a circle. */
  joinCircle(id: string): Promise<void> {
    return apiClient.post(`/circles/${id}/join`);
  },

  /** Leave a circle. */
  leaveCircle(id: string): Promise<void> {
    return apiClient.post(`/circles/${id}/leave`);
  },

  // ---- User ----

  /** Get user profile by ID. */
  getUserProfile(userId: string): Promise<User> {
    return apiClient.get(`/users/${userId}`);
  },

  /** Update current user's profile. */
  updateProfile(data: Partial<{ nickname: string; avatar: string; bio: string; city: string }>): Promise<User> {
    return apiClient.put('/users', data);
  },

  /** Follow / unfollow a user. */
  toggleFollow(userId: string): Promise<{ following: boolean }> {
    return apiClient.post(`/users/${userId}/follow`);
  },

  /** List followers of a user. */
  listFollowers(userId: string): Promise<User[]> {
    return apiClient.get(`/users/${userId}/followers`);
  },

  /** List users that a user is following. */
  listFollowing(userId: string): Promise<User[]> {
    return apiClient.get(`/users/${userId}/following`);
  },

  // ---- Notifications ----

  /** List notifications for the current user. */
  listNotifications(): Promise<Notification[]> {
    return apiClient.get('/users/notifications');
  },

  /** Mark a notification as read. */
  markNotificationRead(notificationId: string): Promise<void> {
    return apiClient.patch(`/users/notifications/${notificationId}/read`);
  },

  /** Mark all notifications as read. */
  markAllNotificationsRead(): Promise<void> {
    return apiClient.patch('/users/notifications/read-all');
  },

  // ---- Data Privacy ----

  /** Export current user's data as JSON (returns blob for download). */
  exportData(): Promise<Blob> {
    return apiClient.get('/users/export', { responseType: 'blob' });
  },

  /** Delete current user's account (soft delete). */
  deleteAccount(): Promise<void> {
    return apiClient.delete('/users');
  },
};
