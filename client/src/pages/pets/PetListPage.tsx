import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import { Plus, PawPrint, Calendar } from 'lucide-react';
import { usePets } from '../../hooks/usePets';
import { useUIStore } from '../../store/uiStore';
import PetSwitcher from '../../components/common/PetSwitcher';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SPECIES_LABELS } from '../../utils/constants';
import { calculateAge } from '../../utils/date';
import { useState } from 'react';

/**
 * PetListPage — displays all pets for the current user with a switcher.
 * Allows creating new pets and navigating to pet detail.
 */
export default function PetListPage() {
  const navigate = useNavigate();
  const { pets, currentPet, setCurrentPet, deletePet } = usePets();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          我的宠物
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate('/pets/new')}
        >
          添加宠物
        </Button>
      </Box>

      {pets.length === 0 ? (
        <EmptyState
          icon={<PawPrint size={48} color="#FF8C42" />}
          title="还没有宠物档案"
          description="创建第一只宠物的健康档案，开始系统化管理"
          action={
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/pets/new')}
              sx={{ mt: 2 }}
            >
              创建宠物档案
            </Button>
          }
        />
      ) : (
        <>
          <PetSwitcher pets={pets} currentPet={currentPet} onSelect={setCurrentPet} />

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {pets.map((pet) => (
              <Grid item xs={12} sm={6} md={4} key={pet.id}>
                <Card>
                  <CardActionArea onClick={() => navigate(`/pets/${pet.id}`)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Avatar
                          src={pet.photo || undefined}
                          sx={{ width: 64, height: 64, bgcolor: 'primary.light' }}
                        >
                          {pet.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {pet.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                            <Chip
                              label={SPECIES_LABELS[pet.species]}
                              size="small"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                            {pet.breed && (
                              <Chip
                                label={pet.breed}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {calculateAge(pet.birthday)} · {pet.weight}kg
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          {currentPet && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Calendar size={18} />}
                onClick={() => navigate('/reminders')}
              >
                查看提醒日程
              </Button>
            </Box>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="删除宠物档案"
        message="确定要删除这个宠物档案吗？所有相关的健康记录和提醒也将被删除，此操作不可撤销。"
        onConfirm={async () => {
          if (deleteTarget) {
            await deletePet(deleteTarget);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
