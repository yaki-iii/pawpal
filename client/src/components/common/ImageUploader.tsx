import { useRef, useState } from 'react';
import { Box, IconButton, Avatar } from '@mui/material';
import { ImagePlus, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  label?: string;
}

/**
 * ImageUploader — image upload component with preview and removal.
 * NOTE: In MVP, images are converted to base64 data URLs for preview.
 * In production, this would upload to a server and return URLs.
 */
export default function ImageUploader({
  images,
  onChange,
  maxImages = 9,
  label = '添加图片',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    const fileArray = Array.from(files).slice(0, remainingSlots);

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onChange([...images, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
      {images.map((img, index) => (
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
          <Avatar
            src={img}
            variant="rounded"
            sx={{ width: '100%', height: '100%' }}
          />
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
      ))}

      {images.length < maxImages && (
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
          <ImagePlus size={24} />
          <Box sx={{ fontSize: '0.65rem', mt: 0.5 }}>{label}</Box>
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </Box>
  );
}
