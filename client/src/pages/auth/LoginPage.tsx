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
import type { LoginPayload } from '../../types';

/**
 * LoginPage — email + password login form.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginPayload>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(form);
      if (success) {
        navigate('/');
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
              养宠人的健康管家 + 同好社区
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            登录
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              还没有账号？{' '}
              <Link to="/register" style={{ color: '#FF8C42', textDecoration: 'none', fontWeight: 600 }}>
                立即注册
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'warm.50', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              测试账号：demo@pawpal.com / demo123456
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
