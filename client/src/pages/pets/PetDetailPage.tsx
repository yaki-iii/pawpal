import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowLeft,
  Syringe,
  Pill,
  Stethoscope,
  Hospital,
  Share2,
  Edit,
  Trash2,
  Calendar,
  Plus,
} from 'lucide-react';
import { usePets, useHealthRecords, useWeightRecords, useReminders } from '../../hooks/usePets';
import { useGrowthDiary } from '../../hooks/useGrowthDiary';
import HealthRecordForm from '../../components/health/HealthRecordForm';
import HealthTimeline from '../../components/health/HealthTimeline';
import WeightChart from '../../components/health/WeightChart';
import ReminderCard from '../../components/health/ReminderCard';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import MediaUploader from '../../components/common/MediaUploader';
import { HealthRecordType } from '../../types';
import {
  HEALTH_RECORD_TYPE_LABELS,
  HEALTH_RECORD_TYPE_COLORS,
  SPECIES_LABELS,
} from '../../utils/constants';
import { calculateAge, formatDate } from '../../utils/date';
import type { HealthRecordFormData } from '../../types';

/** Mood options for growth diary entries. */
const MOOD_OPTIONS: Array<{ value: string; emoji: string; label: string }> = [
  { value: 'happy', emoji: '😊', label: '开心' },
  { value: 'excited', emoji: '🤩', label: '兴奋' },
  { value: 'normal', emoji: '😐', label: '一般' },
  { value: 'sad', emoji: '😢', label: '低落' },
  { value: 'sick', emoji: '🤒', label: '不适' },
  { value: 'sleepy', emoji: '😴', label: '犯困' },
];

/**
 * PetDetailPage — pet detail with 3 tabs: health records, growth diary, reminders.
 */
export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pets, currentPet, setCurrentPet, deletePet } = usePets();
  const { records, createRecord, deleteRecord } = useHealthRecords(id);
  const { weightRecords, addWeight } = useWeightRecords(id);
  const { reminders, markDone } = useReminders(id);

  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<HealthRecordType>(HealthRecordType.VACCINE);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Growth diary entry state
  const { entries: diaryEntries, createEntry, isCreating, deleteEntry } = useGrowthDiary(id);
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryMood, setDiaryMood] = useState('');
  const [diaryFiles, setDiaryFiles] = useState<File[]>([]);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  const pet = pets.find((p) => p.id === id) || currentPet;

  if (!pet) {
    return (
      <EmptyState
        title="宠物不存在"
        description="该宠物档案可能已被删除"
        action={<Button variant="contained" onClick={() => navigate('/pets')}>返回宠物列表</Button>}
      />
    );
  }

  // Ensure currentPet is set
  if (currentPet?.id !== pet.id) {
    setCurrentPet(pet);
  }

  const quickActions = [
    { type: HealthRecordType.VACCINE, label: '记录疫苗', icon: <Syringe size={18} />, color: HEALTH_RECORD_TYPE_COLORS[HealthRecordType.VACCINE] },
    { type: HealthRecordType.DEWORMING, label: '记录驱虫', icon: <Pill size={18} />, color: HEALTH_RECORD_TYPE_COLORS[HealthRecordType.DEWORMING] },
    { type: HealthRecordType.CHECKUP, label: '记录体检', icon: <Stethoscope size={18} />, color: HEALTH_RECORD_TYPE_COLORS[HealthRecordType.CHECKUP] },
    { type: HealthRecordType.VISIT, label: '记录就诊', icon: <Hospital size={18} />, color: HEALTH_RECORD_TYPE_COLORS[HealthRecordType.VISIT] },
  ];

  // Growth diary milestones from health records
  const milestones = records.map((r) => ({
    date: r.date,
    title: `${HEALTH_RECORD_TYPE_LABELS[r.type]}: ${r.itemName}`,
    description: r.notes || '',
  }));

  /** Reset diary form fields to empty defaults. */
  const resetDiaryForm = () => {
    setDiaryTitle('');
    setDiaryContent('');
    setDiaryMood('');
    setDiaryFiles([]);
  };

  return (
    <Box>
      {/* Back button */}
      <Button
        variant="text"
        startIcon={<ArrowLeft size={18} />}
        onClick={() => navigate('/pets')}
        sx={{ color: 'text.secondary', mb: 1 }}
      >
        返回
      </Button>

      {/* Pet info card */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              src={pet.photo || undefined}
              sx={{ width: 72, height: 72, bgcolor: 'primary.light', fontSize: '1.5rem' }}
            >
              {pet.name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {pet.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                <Chip label={SPECIES_LABELS[pet.species]} size="small" />
                {pet.breed && <Chip label={pet.breed} size="small" variant="outlined" />}
                <Chip
                  label={pet.gender === 'MALE' ? '♂ 公' : '♀ 母'}
                  size="small"
                  variant="outlined"
                />
                {pet.neutered && <Chip label="已绝育" size="small" color="secondary" />}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {calculateAge(pet.birthday)} · {pet.weight}kg
                {pet.birthday && ` · 生日 ${formatDate(pet.birthday)}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Edit size={16} />}
                onClick={() => navigate(`/pets/${pet.id}/edit`)}
              >
                编辑
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<Trash2 size={16} />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                删除
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="健康记录" />
        <Tab label="成长日记" />
        <Tab label="提醒日程" />
      </Tabs>

      {/* Tab 1: Health Records */}
      {tabValue === 0 && (
        <Box>
          {/* Quick action buttons */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {quickActions.map((action) => (
              <Grid item xs={6} sm={3} key={action.type}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={action.icon}
                  onClick={() => {
                    setFormType(action.type);
                    setFormOpen(true);
                  }}
                  sx={{
                    borderColor: action.color,
                    color: action.color,
                    '&:hover': { borderColor: action.color, bgcolor: `${action.color}10` },
                  }}
                >
                  {action.label}
                </Button>
              </Grid>
            ))}
          </Grid>

          <HealthTimeline records={records} onDelete={deleteRecord} />
        </Box>
      )}

      {/* Tab 2: Growth Diary */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              成长日记
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Plus size={16} />}
                onClick={() => {
                  resetDiaryForm();
                  setDiaryDialogOpen(true);
                }}
              >
                记录日常
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Share2 size={16} />}
                onClick={() => navigate('/?compose=true')}
              >
                分享到社区
              </Button>
            </Box>
          </Box>

          <WeightChart
            weightRecords={weightRecords}
            onAddWeight={addWeight}
            currentWeight={pet.weight}
            species={pet.species}
          />

          {/* Daily diary entries */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              日常记录
            </Typography>

            {diaryEntries.length === 0 ? (
              <EmptyState
                title="还没有日常记录"
                description="点击「记录日常」，记录毛孩子的成长点滴"
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {diaryEntries.map((entry) => {
                  const moodOpt = MOOD_OPTIONS.find((m) => m.value === entry.mood);
                  return (
                    <Card key={entry.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                              {entry.title && (
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {entry.title}
                                </Typography>
                              )}
                              {entry.mood && moodOpt && (
                                <Chip
                                  size="small"
                                  label={`${moodOpt.emoji} ${moodOpt.label}`}
                                  sx={{ height: 22, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                            {entry.content && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {entry.content}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(entry.createdAt)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteEntryId(entry.id)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>

                        {/* Photos */}
                        {entry.photos.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                            {entry.photos.map((photo, idx) => (
                              <Box
                                key={`p${idx}`}
                                component="img"
                                src={photo}
                                alt={`photo-${idx}`}
                                sx={{
                                  width: 72,
                                  height: 72,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  cursor: 'pointer',
                                }}
                                onClick={() => window.open(photo, '_blank')}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Videos */}
                        {entry.videos.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                            {entry.videos.map((video, idx) => (
                              <Box
                                key={`v${idx}`}
                                component="video"
                                src={video}
                                controls
                                sx={{
                                  width: 160,
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Health milestones */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              健康里程碑
            </Typography>
            {milestones.length === 0 ? (
              <EmptyState
                title="暂无里程碑"
                description="添加健康记录后，里程碑将自动生成"
              />
            ) : (
              <Box sx={{ position: 'relative', pl: 2 }}>
                <Box sx={{ position: 'absolute', left: 12, top: 8, bottom: 8, width: 2, bgcolor: 'warm.100' }} />
                {milestones.map((m, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, pb: 2, position: 'relative' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        mt: 0.5,
                        zIndex: 1,
                      }}
                    />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {m.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(m.date)}
                      </Typography>
                      {m.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {m.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Tab 3: Reminders */}
      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              提醒日程
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Calendar size={16} />}
              onClick={() => navigate('/reminders')}
            >
              全部提醒
            </Button>
          </Box>

          {reminders.length === 0 ? (
            <EmptyState
              title="暂无提醒"
              description="添加疫苗/驱虫/体检记录后，系统会自动生成下次提醒"
            />
          ) : (
            reminders.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                petName={pet.name}
                onMarkDone={markDone}
              />
            ))
          )}
        </Box>
      )}

      {/* Health record form dialog */}
      <HealthRecordForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data: HealthRecordFormData) => {
          await createRecord(data);
        }}
        defaultType={formType}
      />

      {/* Growth diary create dialog */}
      <Dialog open={diaryDialogOpen} onClose={() => setDiaryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>记录日常</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="标题（可选）"
            placeholder="如：今天去公园玩了"
            value={diaryTitle}
            onChange={(e) => setDiaryTitle(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1, mb: 2 }}
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            label="内容"
            placeholder="记录今天的日常..."
            value={diaryContent}
            onChange={(e) => setDiaryContent(e.target.value)}
            fullWidth
            multiline
            rows={3}
            size="small"
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 1000 }}
          />
          {/* Mood selector */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            心情
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {MOOD_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={`${opt.emoji} ${opt.label}`}
                size="small"
                color={diaryMood === opt.value ? 'primary' : 'default'}
                variant={diaryMood === opt.value ? 'filled' : 'outlined'}
                onClick={() => setDiaryMood(diaryMood === opt.value ? '' : opt.value)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
          {/* Media upload */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            图片/视频（可选，最多9个）
          </Typography>
          <MediaUploader files={diaryFiles} onChange={setDiaryFiles} maxFiles={9} label="上传" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiaryDialogOpen(false)} color="inherit">
            取消
          </Button>
          <Button
            variant="contained"
            disabled={isCreating || diaryContent.trim().length === 0}
            startIcon={isCreating ? <CircularProgress size={16} color="inherit" /> : null}
            onClick={async () => {
              try {
                await createEntry({
                  title: diaryTitle.trim(),
                  content: diaryContent.trim(),
                  mood: diaryMood,
                  files: diaryFiles,
                });
                setDiaryDialogOpen(false);
                resetDiaryForm();
              } catch {
                // Error is handled by the mutation's onError callback
              }
            }}
          >
            {isCreating ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Growth diary entry delete confirmation */}
      <ConfirmDialog
        open={!!deleteEntryId}
        title="删除日常记录"
        message="确定要删除这条日常记录吗？此操作不可撤销。"
        confirmText="确认删除"
        danger
        onConfirm={async () => {
          if (deleteEntryId) {
            try {
              await deleteEntry(deleteEntryId);
            } catch {
              // Error is handled by the mutation's onError callback
            }
          }
          setDeleteEntryId(null);
        }}
        onClose={() => setDeleteEntryId(null)}
      />

      {/* Delete pet confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="删除宠物档案"
        message={`确定要删除「${pet.name}」的档案吗？相关的健康记录、体重数据和提醒将一并删除，此操作不可撤销。`}
        confirmText="确认删除"
        danger
        onConfirm={async () => {
          try {
            await deletePet(pet.id);
            setDeleteDialogOpen(false);
            navigate('/pets');
          } catch {
            // Error is handled by the mutation's onError callback
            setDeleteDialogOpen(false);
          }
        }}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
}
