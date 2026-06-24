import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * MainLayout — three-column layout: left sidebar (navigation) + center content + right sidebar.
 * Responsive: sidebars are hidden on smaller screens, mobile bottom nav appears instead.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Left sidebar — navigation (desktop) */}
      <Box
        component="nav"
        sx={{
          width: 240,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'warm.100',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Sidebar />
      </Box>

      {/* Center content area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          maxWidth: 720,
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          pb: { xs: 10, md: 3 }, // Extra bottom padding on mobile for bottom nav
        }}
      >
        {children}
      </Box>

      {/* Right sidebar — recommendations (large screens) */}
      <Box
        component="aside"
        sx={{
          width: 300,
          flexShrink: 0,
          borderLeft: '1px solid',
          borderColor: 'warm.100',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <RightSidebar />
      </Box>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </Box>
  );
}
