import { useState } from 'react';
import { Box, Typography, Tabs, Tab, TextField, InputAdornment, Grid } from '@mui/material';
import { Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/community';
import { useUIStore } from '../../store/uiStore';
import CircleCard from '../../components/community/CircleCard';
import EmptyState from '../../components/common/EmptyState';
import type { Circle, CircleType } from '../../types';

/**
 * CircleSquarePage — browse and search circles.
 * Tabs: breed circles, city circles, my circles.
 */
export default function CircleSquarePage() {
  const [tab, setTab] = useState(0);
  const [keyword, setKeyword] = useState('');
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  const typeFilter = tab === 0 ? 'BREED' : tab === 1 ? 'CITY' : undefined;

  const { data: circles, isLoading } = useQuery({
    queryKey: ['circles', typeFilter, keyword],
    queryFn: () =>
      communityApi.listCircles({
        type: typeFilter,
        keyword: keyword || undefined,
      }),
  });

  const joinMutation = useMutation({
    mutationFn: (circleId: string) => communityApi.joinCircle(circleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      showSnackbar('加入成功', 'success');
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '加入失败', 'error');
    },
  });

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        圈子广场
      </Typography>

      {/* Search */}
      <TextField
        placeholder="搜索圈子名称..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color="#999" />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="品种圈" />
        <Tab label="同城圈" />
        <Tab label="我的圈子" />
      </Tabs>

      {/* Circle grid */}
      {isLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          加载中...
        </Typography>
      ) : (circles || []).length === 0 ? (
        <EmptyState
          title="暂无圈子"
          description={tab === 2 ? '你还没有加入任何圈子' : '试试其他关键词搜索'}
        />
      ) : (
        <Grid container spacing={2}>
          {(circles || []).map((circle) => (
            <Grid item xs={12} sm={6} key={circle.id}>
              <CircleCard
                circle={circle}
                onJoin={(c) => joinMutation.mutate(c.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
