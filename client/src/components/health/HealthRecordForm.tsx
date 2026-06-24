import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { HEALTH_RECORD_TYPE_LABELS } from '../../utils/constants';
import { HealthRecordType } from '../../types';
import ImageUploader from '../common/ImageUploader';
import type { HealthRecordFormData } from '../../types';

interface HealthRecordFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: HealthRecordFormData) => Promise<void>;
  defaultType?: HealthRecordType;
  initialData?: HealthRecordFormData | null;
}

/**
 * HealthRecordForm — modal form for creating/editing health records.
 * Supports 4 types: VACCINE, DEWORMING, CHECKUP, VISIT.
 */
export default function HealthRecordForm({
  open,
  onClose,
  onSubmit,
  defaultType = HealthRecordType.VACCINE,
  initialData,
}: HealthRecordFormProps) {
  const [type, setType] = useState<HealthRecordType>(initialData?.type || defaultType);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [itemName, setItemName] = useState(initialData?.itemName || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        type,
        date,
        itemName: itemName.trim(),
        notes: notes.trim(),
        images,
      });
      onClose();
      // Reset form
      setItemName('');
      setNotes('');
      setImages([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {initialData ? '编辑健康记录' : '添加健康记录'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="记录类型"
            value={type}
            onChange={(e) => setType(e.target.value as HealthRecordType)}
            fullWidth
            size="small"
          >
            {Object.entries(HEALTH_RECORD_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="日期"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="项目名称"
            placeholder="如：狂犬疫苗、体外驱虫、年度体检"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            fullWidth
            size="small"
            required
          />

          <TextField
            label="备注"
            placeholder="补充说明（如：接种后无不良反应）"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={3}
          />

          <Box>
            <Typography variant="body2" color="text.secondary">
              凭证图片（可选）
            </Typography>
            <ImageUploader images={images} onChange={setImages} maxImages={4} label="上传凭证" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !itemName.trim()}
        >
          {submitting ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
