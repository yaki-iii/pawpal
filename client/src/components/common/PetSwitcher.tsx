import { Box, Avatar, Typography, Chip } from '@mui/material';
import { PawPrint } from 'lucide-react';
import type { Pet } from '../../types';
import { SPECIES_LABELS } from '../../utils/constants';
import { calculateAge } from '../../utils/date';

interface PetSwitcherProps {
  pets: Pet[];
  currentPet: Pet | null;
  onSelect: (pet: Pet) => void;
}

/**
 * PetSwitcher — horizontal scrolling list of pet avatars for multi-pet switching.
 */
export default function PetSwitcher({ pets, currentPet, onSelect }: PetSwitcherProps) {
  if (pets.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <PawPrint size={32} color="#FF8C42" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          还没有宠物档案
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        py: 2,
        px: 1,
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {pets.map((pet) => {
        const isActive = currentPet?.id === pet.id;
        return (
          <Box
            key={pet.id}
            onClick={() => onSelect(pet)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              minWidth: 80,
              opacity: isActive ? 1 : 0.6,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: 1 },
            }}
          >
            <Avatar
              src={pet.photo || undefined}
              sx={{
                width: 56,
                height: 56,
                border: isActive ? 3 : 0,
                borderColor: 'primary.main',
                bgcolor: 'primary.light',
              }}
            >
              {pet.name.charAt(0)}
            </Avatar>
            <Typography variant="caption" sx={{ mt: 0.5, fontWeight: isActive ? 600 : 400 }}>
              {pet.name}
            </Typography>
            <Chip
              label={`${SPECIES_LABELS[pet.species]} · ${calculateAge(pet.birthday)}`}
              size="small"
              sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
