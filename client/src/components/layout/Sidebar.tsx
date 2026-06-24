import { Box, Typography, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Button, Badge } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  PawPrint,
  Users,
  Bot,
  BookOpen,
  User,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { NAV_ITEMS } from '../../utils/constants';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Home,
  PawPrint,
  Users,
  Bot,
  BookOpen,
  User,
};

/**
 * Sidebar — left navigation panel.
 * Shows logo, navigation items, and user profile/logout.
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <PawPrint size={28} color="#FF8C42" />
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          PawPal 爪友
        </Typography>
      </Box>

      {/* Navigation items */}
      <List sx={{ flex: 1, mt: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'text.primary',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'warm.50',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: isActive ? 'white' : 'text.secondary' }}>
                {Icon && <Icon size={20} />}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 400 }}
              />
            </ListItemButton>
          );
        })}

        {/* Notifications */}
        <ListItemButton
          onClick={() => navigate('/profile')}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            '&:hover': { bgcolor: 'warm.50' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
            <Badge badgeContent={0} color="error">
              <Bell size={20} />
            </Badge>
          </ListItemIcon>
          <ListItemText
            primary="消息通知"
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </List>

      {/* User profile section */}
      {user && (
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'warm.50',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Avatar
            src={user.avatar || undefined}
            sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
          >
            {user.nickname.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, truncate: 1 }}>
              {user.nickname}
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={handleLogout}
            sx={{ minWidth: 'auto', color: 'text.secondary' }}
          >
            <LogOut size={18} />
          </Button>
        </Box>
      )}
    </Box>
  );
}
