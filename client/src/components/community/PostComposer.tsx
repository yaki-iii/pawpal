import { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { ImagePlus, X, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { communityApi } from '../../api/community';
import { usePets } from '../../hooks/usePets';
import ImageUploader from '../common/ImageUploader';
import type { PostFormData } from '../../types';

interface PostComposerProps {
  onPublish: (data: PostFormData) => Promise<void>;
  defaultContent?: string;
}

/**
 * PostComposer — modal form for creating community posts.
 * Fields: title, content, images, circle selection, pet association, tags.
 */
export default function PostComposer({ onPublish, defaultContent = '' }: PostComposerProps) {
  const { pets } = usePets();
  const { data: circles } = useQuery({
    queryKey: ['circles', 'all'],
    queryFn: () => communityApi.listCircles(),
    staleTime: 10 * 60 * 1000,
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(defaultContent);
  const [images, setImages] = useState<string[]>([]);
  const [circleId, setCircleId] = useState('');
  const [petId, setPetId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [publishing, setPublishing] = useState(false);

  const handleAddTag = () => {
    const tag = tagInput.trim().replace(/^#/, '');
    if (tag && tags.length < 5 && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    setPublishing(true);
    try {
      await onPublish({
        title: title.trim(),
        content: content.trim(),
        circleId: circleId || undefined,
        petId: petId || undefined,
        images,
        tags,
      });
      // Reset form
      setTitle('');
      setContent('');
      setImages([]);
      setCircleId('');
      setPetId('');
      setTags([]);
      setOpen(false);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <>
      {/* Trigger: clickable input area */}
      <Card
        sx={{
          mb: 2,
          cursor: 'pointer',
          '&:hover': { boxShadow: '0 4px 16px rgba(255, 140, 66, 0.12)' },
        }}
        onClick={() => setOpen(true)}
      >
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            分享你和毛孩子的故事...
          </Typography>
          <ImagePlus size={20} color="#FF8C42" />
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>发布动态</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              size="small"
              placeholder="给你的动态起个标题"
            />

            <TextField
              label="正文"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              fullWidth
              required
              size="small"
              multiline
              rows={5}
              placeholder="分享你的养宠经验、日常故事或求助问题..."
            />

            {/* Images */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                图片（最多9张）
              </Typography>
              <ImageUploader images={images} onChange={setImages} maxImages={9} />
            </Box>

            {/* Circle and pet selection */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="选择圈子"
                value={circleId}
                onChange={(e) => setCircleId(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">不选择</MenuItem>
                {(circles || []).map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="关联宠物"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">不关联</MenuItem>
                {pets.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Tags */}
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <TextField
                  size="small"
                  placeholder="添加标签（如：柯基、健康）"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  fullWidth
                />
                <Button size="small" onClick={handleAddTag} variant="outlined">
                  添加
                </Button>
              </Box>
              {tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{ height: 24 }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            取消
          </Button>
          <Button
            onClick={handlePublish}
            variant="contained"
            disabled={publishing || !title.trim() || !content.trim()}
            startIcon={<Send size={16} />}
          >
            {publishing ? '发布中...' : '发布'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
