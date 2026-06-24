import { useState } from 'react';
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
} from '@mui/material';
import { Reply, Trash2, Send } from 'lucide-react';
import type { Comment } from '../../types';
import { formatRelativeTime } from '../../utils/date';
import { useAuthStore } from '../../store/authStore';

interface CommentTreeProps {
  comments: Comment[];
  onReply: (postId: string, content: string, parentId?: string) => Promise<void>;
  onDelete?: (postId: string, commentId: string) => Promise<void>;
  postId: string;
}

/**
 * CommentTree — multi-level comment display with reply functionality.
 * Supports 2 levels: top-level comments and their replies.
 */
export default function CommentTree({ comments, onReply, onDelete, postId }: CommentTreeProps) {
  const { user } = useAuthStore();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    await onReply(postId, replyContent.trim(), parentId);
    setReplyContent('');
    setReplyingTo(null);
  };

  if (comments.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          暂无评论，快来发表第一条评论吧
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {comments.map((comment) => {
        const isCommentAuthor = user?.id === comment.userId;
        return (
          <Box key={comment.id} sx={{ mb: 2 }}>
            {/* Top-level comment */}
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Avatar
                src={comment.author?.avatar || undefined}
                sx={{ width: 36, height: 36, bgcolor: 'secondary.light' }}
              >
                {comment.author?.nickname?.charAt(0) || '?'}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    bgcolor: 'warm.50',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.25 }}>
                    {comment.author?.nickname || '未知用户'}
                  </Typography>
                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5, pl: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(comment.createdAt)}
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Reply size={14} />}
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    sx={{ minWidth: 'auto', fontSize: '0.75rem', color: 'text.secondary' }}
                  >
                    回复
                  </Button>
                  {isCommentAuthor && onDelete && (
                    <IconButton
                      size="small"
                      onClick={() => onDelete(postId, comment.id)}
                      sx={{ color: 'text.secondary' }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Reply input */}
            {replyingTo === comment.id && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, ml: 6 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={`回复 ${comment.author?.nickname}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleReply(comment.id);
                  }}
                />
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyContent.trim()}
                >
                  <Send size={14} />
                </Button>
              </Box>
            )}

            {/* Replies (level 2) */}
            {comment.replies && comment.replies.length > 0 && (
              <Box sx={{ ml: 6, mt: 1 }}>
                {comment.replies.map((reply) => {
                  const isReplyAuthor = user?.id === reply.userId;
                  return (
                    <Box key={reply.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Avatar
                        src={reply.author?.avatar || undefined}
                        sx={{ width: 28, height: 28, bgcolor: 'secondary.light', fontSize: '0.7rem' }}
                      >
                        {reply.author?.nickname?.charAt(0) || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ bgcolor: 'warm.50', borderRadius: 2, p: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem', mb: 0.25 }}>
                            {reply.author?.nickname || '未知用户'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {reply.content}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.25 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatRelativeTime(reply.createdAt)}
                          </Typography>
                          {isReplyAuthor && onDelete && (
                            <Button
                              size="small"
                              startIcon={<Trash2 size={12} />}
                              onClick={() => onDelete(postId, reply.id)}
                              sx={{ minWidth: 'auto', fontSize: '0.7rem', color: 'text.secondary' }}
                            >
                              删除
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            <Divider sx={{ mt: 1 }} />
          </Box>
        );
      })}
    </Box>
  );
}
