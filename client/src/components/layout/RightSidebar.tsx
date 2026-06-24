import { Box, Typography, Card, CardContent, Chip, Divider } from '@mui/material';
import { TrendingUp, Sparkles, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../../api/community';

/**
 * RightSidebar — recommendations panel.
 * Shows: hot topics, recommended circles, nearby pet friends.
 */
export default function RightSidebar() {
  // Fetch circles for recommendation
  const { data: circles } = useQuery({
    queryKey: ['circles', 'recommend'],
    queryFn: () => communityApi.listCircles({ type: 'BREED' }),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Box sx={{ p: 2 }}>
      {/* Hot topics */}
      <Card sx={{ mb: 2, bgcolor: 'warm.50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <TrendingUp size={18} color="#FF8C42" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              热门话题
            </Typography>
          </Box>
          {['#今日萌宠#', '#养猫新手求助#', '#狗狗减肥打卡#', '#疫苗那些事#'].map((topic) => (
            <Box
              key={topic}
              sx={{
                py: 0.75,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                {topic}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </Card>

      {/* Recommended circles */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Sparkles size={18} color="#4ECDC4" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              推荐圈子
            </Typography>
          </Box>
          {(circles || []).slice(0, 5).map((circle) => (
            <Box
              key={circle.id}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 0.75,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  {circle.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {circle.memberCount} 成员
                </Typography>
              </Box>
              <Chip
                label={circle.species === 'DOG' ? '🐕' : circle.species === 'CAT' ? '🐱' : '📍'}
                size="small"
                sx={{ height: 20 }}
              />
            </Box>
          ))}
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />

      {/* Disclaimer */}
      <Box sx={{ p: 1.5, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          PawPal 爪友 · 养宠人的健康管家
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          © 2026 PawPal. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
