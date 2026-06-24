import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../api/community';
import { useUIStore } from '../store/uiStore';
import type { FeedType, PostFormData, Post, Comment, PaginatedData } from '../types';

/**
 * usePosts — community feed with infinite scroll + optimistic updates.
 */
export function useFeed(type: FeedType) {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', type],
    queryFn: async ({ pageParam }) => {
      return communityApi.getFeed(type, pageParam as string | undefined);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
}

/**
 * useCirclePosts — posts within a specific circle.
 */
export function useCirclePosts(circleId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['posts', 'circle', circleId],
    queryFn: async ({ pageParam }) => {
      return communityApi.getCirclePosts(circleId!, pageParam as string | undefined);
    },
    enabled: !!circleId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
}

/**
 * useUserPosts — posts by a specific user.
 */
export function useUserPosts(userId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['posts', 'user', userId],
    queryFn: async ({ pageParam }) => {
      return communityApi.getUserPosts(userId!, pageParam as string | undefined);
    },
    enabled: !!userId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });
}

/**
 * usePostActions — create, delete, like, comment mutations.
 */
export function usePostActions() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  const createPost = useMutation({
    mutationFn: (data: PostFormData) => communityApi.createPost(data),
    onSuccess: (newPost) => {
      // Optimistically prepend the new post to all post feed caches
      // This ensures the post is immediately visible, even in RECOMMEND mode
      // where new posts with 0 engagement would be sorted to the bottom.
      queryClient.setQueriesData<{
        pages: Array<PaginatedData<Post>>;
        pageParams: unknown[];
      }>({ queryKey: ['posts'] }, (oldData) => {
        if (!oldData?.pages || oldData.pages.length === 0) return oldData;
        return {
          ...oldData,
          pages: [
            {
              items: [newPost, ...oldData.pages[0].items],
              nextCursor: oldData.pages[0].nextCursor,
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
      // Invalidate for eventual consistency (background refetch)
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSnackbar('发布成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '发布失败', 'error');
    },
  });

  const deletePost = useMutation({
    mutationFn: (postId: string) => communityApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSnackbar('已删除', 'info');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '删除失败', 'error');
    },
  });

  const toggleLike = useMutation({
    mutationFn: (postId: string) => communityApi.toggleLike(postId),
    onMutate: async (postId) => {
      // Optimistic update: update the post in cache
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      const queryCache = queryClient.getQueriesData<{ pages: Array<{ items: Array<{ id: string; likeCount: number; isLiked?: boolean }> }> }>({
        queryKey: ['posts'],
      });
      queryCache.forEach(([key, data]) => {
        if (!data?.pages) return;
        const newData = {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            items: page.items.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    isLiked: !post.isLiked,
                    likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1,
                  }
                : post,
            ),
          })),
        };
        queryClient.setQueryData(key, newData);
      });
    },
    onError: () => {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const createComment = useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) =>
      communityApi.createComment(postId, content, parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSnackbar('评论成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '评论失败', 'error');
    },
  });

  const deleteComment = useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      communityApi.deleteComment(postId, commentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      showSnackbar('评论已删除', 'info');
    },
  });

  return {
    createPost: createPost.mutateAsync,
    deletePost: deletePost.mutateAsync,
    toggleLike: toggleLike.mutate,
    createComment: createComment.mutateAsync,
    deleteComment: deleteComment.mutateAsync,
    isPublishing: createPost.isPending,
  };
}

/**
 * useComments — fetch comments for a post.
 */
export function useComments(postId: string | undefined) {
  return useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: async () => {
      return communityApi.listComments(postId!);
    },
    enabled: !!postId,
    staleTime: 30 * 1000,
  });
}
