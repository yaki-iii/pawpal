import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import type { Post } from '../../types';
import { formatRelativeTime } from '../../utils/date';
import { useAuthStore } from '../../store/authStore';

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

/**
 * PostCard — community post display card.
 * Shows: author, title, content excerpt, image grid, tags, like/comment counts.
 */
export default function PostCard({ post, onLike, onDelete }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthor = user?.id === post.userId;

  const handleCardClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <Card sx={{ mb: 2, cursor: 'pointer' }} onClick={handleCardClick}>
      <CardContent sx={{ pb: 1 }}>
        {/* Author row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Avatar
            src={post.author?.avatar || undefined}
            sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: '0.875rem' }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${post.userId}`);
            }}
          >
            {post.author?.nickname?.charAt(0) || '?'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {post.author?.nickname || '未知用户'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(post.createdAt)}
              {post.circle && ` · ${post.circle.name}`}
            </Typography>
          </Box>
          {isAuthor && onDelete && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(post.id);
              }}
              sx={{ color: 'text.secondary' }}
            >
              <Trash2 size={16} />
            </IconButton>
          )}
        </Box>

        {/* Title */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {post.title}
        </Typography>

        {/* Content excerpt */}
        <Typography
          variant="body2"
          color="text.primary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: post.images.length > 0 ? 1.5 : 0,
          }}
        >
          {post.content}
        </Typography>

        {/* Image grid (up to 9 images) */}
        {post.images && post.images.length > 0 && (
          <ImageList
            cols={post.images.length === 1 ? 1 : 3}
            gap={4}
            sx={{
              mt: 1,
              maxHeight: post.images.length === 1 ? 300 : 200,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {post.images.slice(0, 9).map((img, i) => (
              <ImageListItem key={i}>
                <img
                  src={img}
                  alt={`图片${i + 1}`}
                  loading="lazy"
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
              </ImageListItem>
            ))}
          </ImageList>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
            {post.tags.map((tag, i) => (
              <Chip
                key={i}
                label={`#${tag}`}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'warm.50' }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, py: 1 }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onLike?.(post.id);
          }}
          sx={{ color: post.isLiked ? 'error.main' : 'text.secondary' }}
        >
          <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {post.likeCount}
          </Typography>
        </IconButton>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          <MessageCircle size={18} />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {post.commentCount}
          </Typography>
        </IconButton>
      </CardActions>
    </Card>
  );
}
