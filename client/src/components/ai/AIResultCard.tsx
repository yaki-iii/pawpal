import { Box, Card, CardContent, Typography, Chip, Divider, Button } from '@mui/material';
import { AlertTriangle, ExternalLink, MessageCircle } from 'lucide-react';
import type { AIAssistantSession, SessionStatus } from '../../types';
import { AI_DISCLAIMER, QUESTION_TYPES } from '../../utils/constants';

interface AIResultCardProps {
  session: AIAssistantSession;
  onUpdateStatus?: (sessionId: string, status: SessionStatus) => void;
  onAskCommunity?: () => void;
}

const STATUS_OPTIONS: Array<{ value: SessionStatus; label: string; color: 'default' | 'primary' | 'success' | 'warning' }> = [
  { value: 'OBSERVING', label: '观察中', color: 'warning' },
  { value: 'RECOVERED', label: '已恢复', color: 'success' },
  { value: 'VISITED_DOCTOR', label: '已就医', color: 'primary' },
];

/**
 * AIResultCard — displays AI consultation results.
 * Shows: question type tag, summary, source citations, disclaimer, status selector.
 */
export default function AIResultCard({ session, onUpdateStatus, onAskCommunity }: AIResultCardProps) {
  const sources = (session.sources || []) as Array<{ type: string; title: string; url: string; snippet: string }>;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Question type tag */}
        {session.questionType && (
          <Box sx={{ mb: 1.5 }}>
            <Chip
              label={`问题类型: ${session.questionType}`}
              color="secondary"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        {/* Question */}
        <Box sx={{ bgcolor: 'warm.50', borderRadius: 2, p: 1.5, mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            你的问题
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {session.question}
          </Typography>
        </Box>

        {/* Summary */}
        {session.summary && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              参考建议
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary' }}
            >
              {session.summary}
            </Typography>
          </Box>
        )}

        {/* Source citations */}
        {sources.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              来源引用
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sources.map((source, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-start',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                  }}
                >
                  <Chip
                    label={source.type === 'post' ? '社区帖' : '知识文章'}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20, fontSize: '0.65rem', flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        '&:hover': { color: 'primary.main' },
                      }}
                      onClick={() => window.open(source.url, '_blank')}
                    >
                      {source.title}
                    </Typography>
                    {source.snippet && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        {source.snippet}
                      </Typography>
                    )}
                  </Box>
                  <ExternalLink size={14} color="#999" style={{ flexShrink: 0, marginTop: 2 }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Disclaimer */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 1.5,
            bgcolor: '#FFF3E0',
            borderRadius: 2,
            border: '1px solid #FFCC80',
          }}
        >
          <AlertTriangle size={18} color="#FF9800" style={{ flexShrink: 0, marginTop: 2 }} />
          <Typography variant="caption" sx={{ color: '#E65100', lineHeight: 1.5 }}>
            {AI_DISCLAIMER}
          </Typography>
        </Box>

        {/* Status selector */}
        {onUpdateStatus && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              后续状态:
            </Typography>
            {STATUS_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
                color={session.status === option.value ? option.color : 'default'}
                variant={session.status === option.value ? 'filled' : 'outlined'}
                onClick={() => onUpdateStatus(session.id, option.value)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        )}

        {/* Ask community button */}
        {onAskCommunity && (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<MessageCircle size={16} />}
            onClick={onAskCommunity}
            sx={{ mt: 2 }}
          >
            去社区提问
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
