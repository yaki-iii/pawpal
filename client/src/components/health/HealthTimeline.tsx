import { Box, Typography, Avatar, Chip, IconButton } from '@mui/material';
import { Trash2 } from 'lucide-react';
import type { HealthRecord } from '../../types';
import { HealthRecordType } from '../../types';
import {
  HEALTH_RECORD_TYPE_LABELS,
  HEALTH_RECORD_TYPE_COLORS,
  HEALTH_RECORD_TYPE_ICONS,
} from '../../utils/constants';
import { formatDate } from '../../utils/date';

interface HealthTimelineProps {
  records: HealthRecord[];
  onDelete?: (recordId: string) => void;
}

/**
 * HealthTimeline — vertical timeline display of health records.
 * Records are displayed in reverse chronological order with type icons and colors.
 */
export default function HealthTimeline({ records, onDelete }: HealthTimelineProps) {
  if (records.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          暂无健康记录，点击上方按钮添加第一条记录
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', pl: 2 }}>
      {/* Timeline vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: 28,
          top: 12,
          bottom: 12,
          width: 2,
          bgcolor: 'warm.100',
        }}
      />

      {records.map((record) => {
        const color = HEALTH_RECORD_TYPE_COLORS[record.type];
        return (
          <Box
            key={record.id}
            sx={{
              display: 'flex',
              gap: 2,
              pb: 3,
              position: 'relative',
            }}
          >
            {/* Timeline dot */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: color,
                fontSize: '1.2rem',
                zIndex: 1,
              }}
            >
              {HEALTH_RECORD_TYPE_ICONS[record.type]}
            </Avatar>

            {/* Content card */}
            <Box
              sx={{
                flex: 1,
                bgcolor: 'background.paper',
                borderRadius: 3,
                p: 2,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Chip
                    label={HEALTH_RECORD_TYPE_LABELS[record.type]}
                    size="small"
                    sx={{ bgcolor: color, color: 'white', height: 20, fontSize: '0.7rem', mb: 0.5 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {record.itemName}
                  </Typography>
                </Box>
                {onDelete && (
                  <IconButton
                    size="small"
                    onClick={() => onDelete(record.id)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary">
                {formatDate(record.date)}
              </Typography>

              {record.notes && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                  {record.notes}
                </Typography>
              )}

              {record.images && record.images.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {record.images.map((img, i) => (
                    <Avatar
                      key={i}
                      src={img}
                      variant="rounded"
                      sx={{ width: 60, height: 60 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
