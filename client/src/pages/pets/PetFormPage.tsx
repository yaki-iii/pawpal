import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { usePets } from '../../hooks/usePets';
import ImageUploader from '../../components/common/ImageUploader';
import { DOG_BREEDS, CAT_BREEDS, SPECIES_LABELS } from '../../utils/constants';
import { PetSpecies, PetGender } from '../../types';
import type { PetFormData } from '../../types';

/**
 * PetFormPage — create or edit a pet profile.
 * Detects mode (create/edit) based on route params.
 */
export default function PetFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { createPet, updatePet, pets } = usePets();

  const existingPet = isEdit ? pets.find((p) => p.id === id) : null;

  const [form, setForm] = useState<PetFormData>({
    name: existingPet?.name || '',
    species: existingPet?.species || PetSpecies.DOG,
    breed: existingPet?.breed || '',
    gender: existingPet?.gender || PetGender.MALE,
    birthday: existingPet?.birthday ? existingPet.birthday.slice(0, 10) : '',
    weight: existingPet?.weight || 0,
    photo: existingPet?.photo || '',
    neutered: existingPet?.neutered ?? false,
  });

  const [photoPreview, setPhotoPreview] = useState<string[]>(form.photo ? [form.photo] : []);
  const [loading, setLoading] = useState(false);

  const breedList = form.species === PetSpecies.DOG ? DOG_BREEDS : CAT_BREEDS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, photo: photoPreview[0] || '' };
      if (isEdit && id) {
        await updatePet({ id, data });
      } else {
        await createPet(data);
      }
      navigate('/pets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate('/pets')}
          sx={{ color: 'text.secondary' }}
        >
          返回
        </Button>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {isEdit ? '编辑宠物档案' : '创建宠物档案'}
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Pet photo */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                宠物照片
              </Typography>
              <ImageUploader
                images={photoPreview}
                onChange={setPhotoPreview}
                maxImages={1}
                label="上传照片"
              />
            </Box>

            {/* Name */}
            <TextField
              label="宠物名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
              size="small"
            />

            {/* Species */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                宠物种类
              </Typography>
              <ToggleButtonGroup
                value={form.species}
                exclusive
                onChange={(_, val) => val && setForm({ ...form, species: val, breed: '' })}
                size="small"
                fullWidth
              >
                <ToggleButton value={PetSpecies.DOG} sx={{ py: 0.5 }}>
                  🐕 {SPECIES_LABELS[PetSpecies.DOG]}
                </ToggleButton>
                <ToggleButton value={PetSpecies.CAT} sx={{ py: 0.5 }}>
                  🐱 {SPECIES_LABELS[PetSpecies.CAT]}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Breed */}
            <TextField
              select
              label="品种"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              fullWidth
              required
              size="small"
            >
              {breedList.map((breed) => (
                <MenuItem key={breed} value={breed}>
                  {breed}
                </MenuItem>
              ))}
            </TextField>

            {/* Gender */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                性别
              </Typography>
              <ToggleButtonGroup
                value={form.gender}
                exclusive
                onChange={(_, val) => val && setForm({ ...form, gender: val })}
                size="small"
                fullWidth
              >
                <ToggleButton value={PetGender.MALE} sx={{ py: 0.5 }}>公</ToggleButton>
                <ToggleButton value={PetGender.FEMALE} sx={{ py: 0.5 }}>母</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Birthday */}
            <TextField
              label="出生日期"
              type="date"
              value={form.birthday}
              onChange={(e) => setForm({ ...form, birthday: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />

            {/* Weight */}
            <TextField
              label="体重 (kg)"
              type="number"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) || 0 })}
              fullWidth
              size="small"
              inputProps={{ step: '0.1', min: '0' }}
            />

            {/* Neutered */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.neutered}
                  onChange={(e) => setForm({ ...form, neutered: e.target.checked })}
                  color="primary"
                />
              }
              label="已绝育"
            />

            {/* Submit */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !form.name || !form.breed}
              >
                {loading ? '保存中...' : isEdit ? '保存修改' : '创建档案'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/pets')}
                fullWidth
              >
                取消
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
