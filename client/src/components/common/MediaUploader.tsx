import { useRef } from 'react';
import { Box, IconButton, Avatar, Typography } from '@mui/material';
import { ImagePlus, X, Video, Film } from 'lucide-react';

interface MediaUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
}

/**
 * MediaUploader — mixed image and video upload component with preview.
 * Unlike ImageUploader (which uses base64 data URLs), this component
 * works with actual File objects for FormData upload to the server.
 */
export default function MediaUploader({
  files,
  onChange,
  maxFiles = 9,
  label = '添加图片/视频',
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef<string[]>([]);

  // Generate preview URLs for current files
  const getPreviewUrl = (file: File): string => {
    const existingIndex = previewUrls.current.findIndex(
      (_, i) => files[i] === file,
    );
    if (existingIndex >= 0 && previewUrls.current[existingIndex]) {
      return previewUrls.current[existingIndex];
    }
    const url = URL.createObjectURL(file);
    previewUrls.current.push(url);
    return url;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const remainingSlots = maxFiles - files.length;
    const fileArray = Array.from(selected).slice(0, remainingSlots);
    onChange([...files, ...fileArray]);

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    // Revoke the object URL to free memory
    if (previewUrls.current[index]) {
      URL.revokeObjectURL(previewUrls.current[index]);
    }
    previewUrls.current.splice(index, 1);
    onChange(files.filter((_, i) => i !== index));
  };

  const isVideo = (file: File): boolean => file.type.startsWith('video/');

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {files.map((file, index) => {
        const video = isVideo(file);
        const previewUrl = getPreviewUrl(file);
        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              width: 80,
              height: 80,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {video ? (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: '#1a1a2e',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Film size={24} />
                <Typography sx={{ fontSize: '0.55rem', mt: 0.5 }}>视频</Typography>
              </Box>
            ) : (
              <Avatar
                src={previewUrl}
                variant="rounded"
                sx={{ width: '100%', height: '100%' }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => handleRemove(index)}
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                width: 20,
                height: 20,
                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
              }}
            >
              <X size={14} />
            </IconButton>
          </Box>
        );
      })}

      {files.length < maxFiles && (
        <Box
          onClick={() => inputRef.current?.click()}
          sx={{
            width: 80,
            height: 80,
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'primary.light',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'primary.main',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'warm.50',
            },
          }}
        >
          <ImagePlus size={20} />
          <Video size={20} />
          <Box sx={{ fontSize: '0.6rem', mt: 0.5, textAlign: 'center' }}>{label}</Box>
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </Box>
  );
}
