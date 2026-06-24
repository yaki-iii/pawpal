import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useReminders } from '../../hooks/usePets';
import ReminderCard from '../../components/health/ReminderCard';
import EmptyState from '../../components/common/EmptyState';

/**
 * ReminderPage — all reminders across all pets.
 * Tab filter: all, overdue, upcoming, done.
 */
export default function ReminderPage() {
  const navigate = useNavigate();
  const { reminders, markDone } = useReminders(); // all reminders for user
  const [tab, setTab] = useState(0);

  const filteredReminders = reminders.filter((r) => {
    if (tab === 0) return true; // all
    if (tab === 1) return r.status === 'OVERDUE'; // overdue
    if (tab === 2) return r.status === 'PENDING' || r.status === 'NOTIFIED'; // upcoming
    if (tab === 3) return r.status === 'DONE'; // done
    return true;
  });

  return (
    <Box>
      <Button
        variant="text"
        startIcon={<ArrowLeft size={18} />}
        onClick={() => navigate('/pets')}
        sx={{ color: 'text.secondary', mb: 1 }}
      >
        返回
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Calendar size={24} color="#FF8C42" />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          提醒日程
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="全部" />
        <Tab label="已过期" />
        <Tab label="待提醒" />
        <Tab label="已完成" />
      </Tabs>

      {filteredReminders.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} color="#FF8C42" />}
          title="暂无提醒"
          description="添加疫苗/驱虫/体检记录后，系统会自动生成下次提醒"
        />
      ) : (
        filteredReminders.map((r) => (
          <ReminderCard
            key={r.id}
            reminder={r}
            petName={r.pet?.name}
            onMarkDone={markDone}
          />
        ))
      )}
    </Box>
  );
}
