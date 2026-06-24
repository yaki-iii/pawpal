import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActionArea, Box, Typography, Chip, Avatar } from '@mui/material';
import { Users, MessageSquare } from 'lucide-react';
import type { Circle } from '../../types';

interface CircleCardProps {
  circle: Circle;
  onJoin?: (circle: Circle) => void;
}

/**
 * CircleCard — circle display card with name, description, member/post counts.
 */
export default function CircleCard({ circle, onJoin }: CircleCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardActionArea onClick={() => navigate(`/circles/${circle.id}`)}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
            <Avatar
              src={circle.coverImage || undefined}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.light',
                fontSize: '1.5rem',
              }}
            >
              {circle.species === 'DOG' ? '🐕' : circle.species === 'CAT' ? '🐱' : '📍'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.25 }}>
                {circle.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {circle.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 0.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Users size={12} color="#999" />
                  <Typography variant="caption" color="text.secondary">
                    {circle.memberCount}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <MessageSquare size={12} color="#999" />
                  <Typography variant="caption" color="text.secondary">
                    {circle.postCount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
