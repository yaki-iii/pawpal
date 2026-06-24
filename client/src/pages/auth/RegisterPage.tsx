import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material';
import { PawPrint } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterPayload } from '../../types';

/**
 * RegisterPage — email + password + nickname registration form.
 * After successful registration, redirects to pet creation page.
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterPayload>({
    email: '',
    password: '',
    nickname: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await register(form);
      if (success) {
        navigate('/pets/new');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PawPrint size={32} color="#FF8C42" />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                PawPal 爪友
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              加入 PawPal，开启科学养宠之旅
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            注册
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="昵称"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              fullWidth
              required
              size="small"
              placeholder="如：煤球妈妈"
            />
            <TextField
              label="邮箱"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              required
              size="small"
            />
            <TextField
              label="密码"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
              required
              size="small"
              helperText="至少6位"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? '注册中...' : '注册'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              已有账号？{' '}
              <Link to="/login" style={{ color: '#FF8C42', textDecoration: 'none', fontWeight: 600 }}>
                去登录
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
