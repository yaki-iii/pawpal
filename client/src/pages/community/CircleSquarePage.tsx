import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '../../api/community';
import { useUIStore } from '../../store/uiStore';
import CircleCard from '../../components/community/CircleCard';
import EmptyState from '../../components/common/EmptyState';

/**
 * CircleSquarePage — browse, search, and create circles.
 * Tabs: breed circles, city circles, my circles, topic circles.
 */
export default function CircleSquarePage() {
  const [tab, setTab] = useState(0);
  const [keyword, setKeyword] = useState('');
  const queryClient = useQueryClient();
  const { showSnackbar } = useUIStore();

  // Create circle dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [circleForm, setCircleForm] = useState({ name: '', description: '' });

  const typeFilter = tab === 0 ? 'BREED' : tab === 1 ? 'CITY' : tab === 3 ? 'TOPIC' : undefined;

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

  const createCircleMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      communityApi.createCircle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circles'] });
      showSnackbar('创建成功', 'success');
      setCreateDialogOpen(false);
      setCircleForm({ name: '', description: '' });
    },
    onError: (error) => {
      showSnackbar((error as Error).message || '创建失败', 'error');
    },
  });

  const handleCreateCircle = () => {
    if (circleForm.name.trim().length < 2 || circleForm.name.trim().length > 20) {
      showSnackbar('圈子名称需要 2-20 个字', 'warning');
      return;
    }
    createCircleMutation.mutate({
      name: circleForm.name.trim(),
      description: circleForm.description.trim() || undefined,
    });
  };

  return (
    <Box>
      {/* Title + Create button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          圈子广场
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Plus size={18} />}
          onClick={() => setCreateDialogOpen(true)}
        >
          创建圈子
        </Button>
      </Box>

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
        <Tab label="话题圈" />
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

      {/* Create circle dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>创建圈子</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="圈子名称"
              required
              value={circleForm.name}
              onChange={(e) => setCircleForm({ ...circleForm, name: e.target.value })}
              fullWidth
              size="small"
              error={circleForm.name.length > 0 && (circleForm.name.length < 2 || circleForm.name.length > 20)}
              helperText="2-20 个字"
              inputProps={{ maxLength: 20 }}
            />
            <TextField
              label="圈子描述"
              value={circleForm.description}
              onChange={(e) => setCircleForm({ ...circleForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              size="small"
              helperText="可选，最多 200 字"
              inputProps={{ maxLength: 200 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            disabled={createCircleMutation.isPending || circleForm.name.trim().length < 2}
            onClick={handleCreateCircle}
          >
            {createCircleMutation.isPending ? '创建中...' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
