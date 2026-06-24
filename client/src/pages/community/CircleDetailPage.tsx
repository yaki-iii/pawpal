import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Card, CardContent, Chip } from '@mui/material';
import { ArrowLeft, Users, MessageSquare, LogIn, LogOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/community';
import { useCirclePosts, usePostActions } from '../../hooks/usePosts';
import { useUIStore } from '../../store/uiStore';
import PostCard from '../../components/community/PostCard';
import PostComposer from '../../components/community/PostComposer';
import InfiniteScrollList from '../../components/common/InfiniteScrollList';

/**
 * CircleDetailPage — circle detail with circle info and in-circle feed.
 */
export default function CircleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  const { data: circle } = useQuery({
    queryKey: ['circle', id],
    queryFn: () => communityApi.getCircleById(id!),
    enabled: !!id,
  });

  const { data, fetchNextPage, hasNextPage, isFetching } = useCirclePosts(id);
  const { createPost, deletePost, toggleLike } = usePostActions();

  const joinMutation = useMutation({
    mutationFn: () => communityApi.joinCircle(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle', id] });
      showSnackbar('加入成功', 'success');
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => communityApi.leaveCircle(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle', id] });
      showSnackbar('已退出圈子', 'info');
    },
  });

  const allPosts = data?.pages.flatMap((p) => p.items) || [];

  if (!circle) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box>
      <Button
        variant="text"
        startIcon={<ArrowLeft size={18} />}
        onClick={() => navigate('/circles')}
        sx={{ color: 'text.secondary', mb: 1 }}
      >
        返回圈子广场
      </Button>

      {/* Circle info card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              {circle.species === 'DOG' ? '🐕' : circle.species === 'CAT' ? '🐱' : '📍'}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {circle.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {circle.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  icon={<Users size={14} />}
                  label={`${circle.memberCount} 成员`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<MessageSquare size={14} />}
                  label={`${circle.postCount} 动态`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
            {circle.isJoined ? (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<LogOut size={16} />}
                onClick={() => leaveMutation.mutate()}
              >
                退出圈子
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<LogIn size={16} />}
                onClick={() => joinMutation.mutate()}
              >
                加入圈子
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Post composer (if joined) */}
      {circle.isJoined && <PostComposer onPublish={createPost} />}

      {/* Circle feed */}
      <InfiniteScrollList
        items={allPosts}
        hasMore={!!hasNextPage}
        isLoading={isFetching}
        onLoadMore={() => fetchNextPage()}
        keyExtractor={(post) => post.id}
        emptyMessage="圈内暂无动态，快来发布第一条吧！"
        renderItem={(post) => (
          <PostCard post={post} onLike={toggleLike} onDelete={deletePost} />
        )}
      />
    </Box>
  );
}
