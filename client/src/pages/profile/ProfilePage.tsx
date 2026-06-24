import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
} from '@mui/material';
import { Download, Trash2, UserPlus, UserCheck, PawPrint } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/community';
import { usePets } from '../../hooks/usePets';
import { useUserPosts, usePostActions } from '../../hooks/usePosts';
import PostCard from '../../components/community/PostCard';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InfiniteScrollList from '../../components/common/InfiniteScrollList';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { SPECIES_LABELS } from '../../utils/constants';
import { calculateAge } from '../../utils/date';
import type { User } from '../../types';

/**
 * ProfilePage — user profile with tabs: posts, pets, and data privacy actions.
 */
export default function ProfilePage() {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const userId = paramUserId || currentUser?.id || '';
  const isOwnProfile = !paramUserId || paramUserId === currentUser?.id;

  const [tab, setTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { showSnackbar } = useUIStore();
  const { pets } = usePets();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<User & { followerCount?: number; followingCount?: number; postCount?: number; isFollowing?: boolean }>({
    queryKey: ['user-profile', userId],
    queryFn: () => communityApi.getUserProfile(userId),
    enabled: !!userId,
  });

  const { data, fetchNextPage, hasNextPage, isFetching } = useUserPosts(userId);
  const { toggleLike, deletePost } = usePostActions();
  const allPosts = data?.pages.flatMap((p) => p.items) || [];

  const followMutation = useMutation({
    mutationFn: () => communityApi.toggleFollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      showSnackbar(profile?.isFollowing ? '已取消关注' : '关注成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '操作失败', 'error');
    },
  });

  const handleFollow = () => {
    followMutation.mutate();
  };

  const handleExportData = async () => {
    try {
      const blob = await communityApi.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pawpal-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      showSnackbar('数据导出成功', 'success');
    } catch (error) {
      showSnackbar((error as Error).message || '导出失败', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await communityApi.deleteAccount();
      showSnackbar('账号已注销', 'info');
      window.location.href = '/login';
    } catch (error) {
      showSnackbar((error as Error).message || '操作失败', 'error');
    }
    setDeleteDialogOpen(false);
  };

  if (!profile) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box>
      {/* Profile header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              src={profile.avatar || undefined}
              sx={{ width: 80, height: 80, bgcolor: 'primary.light', fontSize: '2rem' }}
            >
              {profile.nickname?.charAt(0) || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {profile.nickname}
              </Typography>
              {profile.bio && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {profile.bio}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>{profile.followingCount || 0}</strong> 关注
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>{profile.followerCount || 0}</strong> 粉丝
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  <strong>{profile.postCount || 0}</strong> 动态
                </Typography>
              </Box>
            </Box>
            {!isOwnProfile && (
              <Button
                variant={profile.isFollowing ? 'outlined' : 'contained'}
                startIcon={profile.isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
                onClick={handleFollow}
              >
                {profile.isFollowing ? '已关注' : '关注'}
              </Button>
            )}
          </Box>

          {/* Data privacy actions (own profile only) */}
          {isOwnProfile && (
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Download size={14} />}
                onClick={handleExportData}
              >
                导出数据
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<Trash2 size={14} />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                注销账号
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="动态" />
        <Tab label="宠物" />
      </Tabs>

      {/* Tab: Posts */}
      {tab === 0 && (
        <InfiniteScrollList
          items={allPosts}
          hasMore={!!hasNextPage}
          isLoading={isFetching}
          onLoadMore={() => fetchNextPage()}
          keyExtractor={(post) => post.id}
          emptyMessage="暂无动态"
          renderItem={(post) => (
            <PostCard post={post} onLike={toggleLike} onDelete={isOwnProfile ? deletePost : undefined} />
          )}
        />
      )}

      {/* Tab: Pets */}
      {tab === 1 && (
        <>
          {isOwnProfile && pets.length === 0 ? (
            <EmptyState
              icon={<PawPrint size={48} color="#FF8C42" />}
              title="还没有宠物档案"
              description="创建第一只宠物的健康档案"
            />
          ) : (
            <Grid container spacing={2}>
              {pets.map((pet) => (
                <Grid item xs={12} sm={6} key={pet.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Avatar
                          src={pet.photo || undefined}
                          sx={{ width: 56, height: 56, bgcolor: 'primary.light' }}
                        >
                          {pet.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {pet.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip label={SPECIES_LABELS[pet.species]} size="small" />
                            {pet.breed && <Chip label={pet.breed} size="small" variant="outlined" />}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {calculateAge(pet.birthday)} · {pet.weight}kg
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Delete account confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="注销账号"
        message="确定要注销账号吗？你的所有数据将在30天后被永久删除。此操作不可撤销。"
        confirmText="确认注销"
        danger
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
}
