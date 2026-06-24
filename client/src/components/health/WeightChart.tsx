import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { WeightRecord } from '../../types';
import { formatDate } from '../../utils/date';

interface WeightChartProps {
  weightRecords: WeightRecord[];
  onAddWeight?: (weight: number, date: string) => Promise<void>;
  currentWeight?: number;
  species?: string;
}

/**
 * WeightChart — weight trend line chart using Recharts.
 * Shows historical weight records with a "add weight" dialog.
 */
export default function WeightChart({
  weightRecords,
  onAddWeight,
  currentWeight = 0,
  species = 'DOG',
}: WeightChartProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  // Format data for Recharts
  const chartData = weightRecords.map((r) => ({
    date: formatDate(r.date),
    weight: r.weight,
    rawDate: r.date,
  }));

  // Healthy weight ranges (rough estimates based on species)
  const healthyMin = species === 'CAT' ? 3 : 5;
  const healthyMax = species === 'CAT' ? 6 : 30;

  const handleAddWeight = async () => {
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0 || !onAddWeight) return;

    setSubmitting(true);
    try {
      await onAddWeight(weightNum, newDate);
      setDialogOpen(false);
      setNewWeight('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            体重趋势
          </Typography>
          <Typography variant="body2" color="text.secondary">
            当前体重: {currentWeight} kg
          </Typography>
        </Box>
        {onAddWeight && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => setDialogOpen(true)}
          >
            记录体重
          </Button>
        )}
      </Box>

      {chartData.length === 0 ? (
        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            暂无体重记录
          </Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF0E6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                label={{ value: 'kg', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [`${value} kg`, '体重']}
              />
              <ReferenceArea y1={healthyMin} y2={healthyMax} fill="#4ECDC4" fillOpacity={0.1} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#FF8C42"
                strokeWidth={2}
                dot={{ fill: '#FF8C42', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* Add weight dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>记录体重</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="体重 (kg)"
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              fullWidth
              size="small"
              inputProps={{ step: '0.1', min: '0' }}
            />
            <TextField
              label="日期"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            取消
          </Button>
          <Button
            onClick={handleAddWeight}
            variant="contained"
            disabled={submitting || !newWeight}
          >
            {submitting ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
