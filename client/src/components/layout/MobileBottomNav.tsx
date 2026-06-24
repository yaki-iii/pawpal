import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  PawPrint,
  Bot,
  Users,
  User,
  BookOpen,
} from 'lucide-react';
import { NAV_ITEMS } from '../../utils/constants';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Home,
  PawPrint,
  Users,
  Bot,
  BookOpen,
  User,
};

// Show only the 5 most important items on mobile bottom nav
const MOBILE_ITEMS = NAV_ITEMS.filter((item) =>
  ['/', '/pets', '/ai', '/circles', '/profile'].includes(item.path)
);

/**
 * MobileBottomNav — bottom navigation bar for small screens.
 * Visible only below the `md` breakpoint (960px).
 */
export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = MOBILE_ITEMS.findIndex(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path))
  );

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        display: { xs: 'block', md: 'none' },
        borderRadius: 0,
      }}
    >
      <BottomNavigation
        value={currentPath >= 0 ? currentPath : 0}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            py: 0.5,
          },
          '& .Mui-selected': {
            color: 'primary.main',
          },
        }}
      >
        {MOBILE_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={Icon ? <Icon size={20} /> : null}
              onClick={() => navigate(item.path)}
            />
          );
        })}
      </BottomNavigation>
    </Paper>
  );
}
