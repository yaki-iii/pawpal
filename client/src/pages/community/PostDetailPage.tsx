import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { ArrowLeft, Heart, MessageCircle, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../../api/community';
import { usePostActions, useComments } from '../../hooks/usePosts';
import CommentTree from '../../components/community/CommentTree';
import { formatRelativeTime, formatDateTime } from '../../utils/date';
import EmptyState from '../../components/common/EmptyState';

/**
 * PostDetailPage — full post display with comments section.
 */
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => communityApi.getPostById(id!),
    enabled: !!id,
  });

  const { data: comments } = useComments(id);
  const { toggleLike, createComment, deletePost, deleteComment } = usePostActions();

  const commentsList = comments || [];

  const handleComment = async () => {
    if (!commentText.trim() || !id) return;
    await createComment({ postId: id, content: commentText.trim() });
    setCommentText('');
  };

  if (isLoading || !post) {
    return <Typography>加载中...</Typography>;
  }

  return (
    <Box>
      <Button
        variant="text"
        startIcon={<ArrowLeft size={18} />}
        onClick={() => navigate(-1)}
        sx={{ color: 'text.secondary', mb: 1 }}
      >
        返回
      </Button>

      {/* Post content */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          {/* Author */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
            <Avatar
              src={post.author?.avatar || undefined}
              sx={{ width: 44, height: 44, bgcolor: 'primary.light' }}
              onClick={() => navigate(`/profile/${post.userId}`)}
            >
              {post.author?.nickname?.charAt(0) || '?'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {post.author?.nickname || '未知用户'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(post.createdAt)}
                {post.circle && ` · ${post.circle.name}`}
              </Typography>
            </Box>
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {post.title}
          </Typography>

          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 2 }}>
            {post.content}
          </Typography>

          {/* Images */}
          {post.images && post.images.length > 0 && (
            <ImageList cols={3} gap={8} sx={{ mb: 2 }}>
              {post.images.map((img, i) => (
                <ImageListItem key={i}>
                  <img src={img} alt={`图片${i + 1}`} style={{ borderRadius: 8 }} />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {post.tags.map((tag, i) => (
                <Chip key={i} label={`#${tag}`} size="small" sx={{ bgcolor: 'warm.50' }} />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 1.5 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              size="small"
              startIcon={<Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />}
              onClick={() => toggleLike(post.id)}
              sx={{ color: post.isLiked ? 'error.main' : 'text.secondary' }}
            >
              {post.likeCount}
            </Button>
            <Button size="small" startIcon={<MessageCircle size={18} />} sx={{ color: 'text.secondary' }}>
              {post.commentCount}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Comment input */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              placeholder="发表评论..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              fullWidth
              size="small"
              multiline
              maxRows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleComment}
              disabled={!commentText.trim()}
              sx={{ minWidth: 'auto' }}
            >
              <Send size={18} />
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Comments */}
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          评论 ({post.commentCount})
        </Typography>
        {commentsList.length === 0 ? (
          <EmptyState title="暂无评论" description="快来发表第一条评论吧" />
        ) : (
          <CommentTree
            comments={commentsList}
            postId={post.id}
            onReply={createComment}
            onDelete={deleteComment}
          />
        )}
      </Box>
    </Box>
  );
}
