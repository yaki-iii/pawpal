import { Box, Card, CardContent, Typography, Chip, Button } from '@mui/material';
import { Clock, Check } from 'lucide-react';
import type { Reminder } from '../../types';
import {
  REMINDER_STATUS_LABELS,
  REMINDER_STATUS_COLORS,
  REMINDER_CYCLES,
} from '../../utils/constants';
import { getUrgencyColor, getUrgencyLabel, formatDate } from '../../utils/date';

interface ReminderCardProps {
  reminder: Reminder;
  petName?: string;
  onMarkDone?: (reminderId: string) => void;
}

/**
 * ReminderCard — displays a single reminder with urgency-based color coding.
 * Colors: red=overdue, orange=urgent(3 days), yellow=soon(7 days), green=future
 */
export default function ReminderCard({ reminder, petName, onMarkDone }: ReminderCardProps) {
  const urgencyColor = getUrgencyColor(reminder.nextDate);
  const urgencyLabel = getUrgencyLabel(reminder.nextDate);
  const statusColor = REMINDER_STATUS_COLORS[reminder.status];

  const typeLabels: Record<string, string> = {
    VACCINE: '疫苗',
    DEWORMING: '驱虫',
    CHECKUP: '体检',
  };

  return (
    <Card
      sx={{
        borderLeft: 4,
        borderLeftColor: urgencyColor,
        mb: 1.5,
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
              <Chip
                label={typeLabels[reminder.type] || reminder.type}
                size="small"
                sx={{ bgcolor: urgencyColor, color: 'white', height: 20, fontSize: '0.7rem' }}
              />
              <Chip
                label={REMINDER_STATUS_LABELS[reminder.status]}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem', color: statusColor, borderColor: statusColor }}
                variant="outlined"
              />
            </Box>

            {petName && (
              <Typography variant="caption" color="text.secondary">
                {petName}
              </Typography>
            )}

            <Typography variant="body2" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Clock size={14} color={urgencyColor} />
              <span style={{ color: urgencyColor, fontWeight: 600 }}>{urgencyLabel}</span>
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              到期日: {formatDate(reminder.nextDate)} · 周期: {reminder.cycleDays}天
            </Typography>
          </Box>

          {onMarkDone && reminder.status !== 'DONE' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Check size={14} />}
              onClick={() => onMarkDone(reminder.id)}
              sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
            >
              完成
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
