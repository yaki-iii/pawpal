import { Box, Typography, List, ListItemButton, ListItemText, Chip, Divider } from '@mui/material';
import { Clock } from 'lucide-react';
import type { AIAssistantSession, SessionStatus } from '../../types';
import { formatRelativeTime } from '../../utils/date';

interface AIHistoryListProps {
  sessions: AIAssistantSession[];
  onSelect?: (session: AIAssistantSession) => void;
  selectedId?: string;
}

const STATUS_LABELS: Record<SessionStatus, string> = {
  OBSERVING: '观察中',
  RECOVERED: '已恢复',
  VISITED_DOCTOR: '已就医',
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  OBSERVING: '#FF9800',
  RECOVERED: '#4CAF50',
  VISITED_DOCTOR: '#2196F3',
};

/**
 * AIHistoryList — list of past AI consultation sessions.
 * Shows question, type, status, and relative time.
 */
export default function AIHistoryList({ sessions, onSelect, selectedId }: AIHistoryListProps) {
  if (sessions.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Clock size={32} color="#CCC" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          暂无咨询历史
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ py: 0 }}>
      {sessions.map((session, index) => (
        <Box key={session.id}>
          <ListItemButton
            onClick={() => onSelect?.(session)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              bgcolor: selectedId === session.id ? 'warm.50' : 'transparent',
              '&:hover': { bgcolor: 'warm.50' },
            }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {session.question.substring(0, 30)}
                    {session.question.length > 30 ? '...' : ''}
                  </Typography>
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  {session.questionType && (
                    <Chip
                      label={session.questionType}
                      size="small"
                      sx={{ height: 16, fontSize: '0.6rem' }}
                    />
                  )}
                  <Chip
                    label={STATUS_LABELS[session.status]}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.6rem',
                      color: STATUS_COLORS[session.status],
                      borderColor: STATUS_COLORS[session.status],
                    }}
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {formatRelativeTime(session.createdAt)}
                  </Typography>
                </Box>
              }
            />
          </ListItemButton>
          {index < sessions.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
}
