import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  rightSidebarOpen: boolean;
  globalLoading: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  };

  toggleSidebar: () => void;
  toggleRightSidebar: () => void;
  setGlobalLoading: (loading: boolean) => void;
  showSnackbar: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
  closeSnackbar: () => void;
}

/**
 * UI store — manages global UI state (sidebar, loading, snackbar).
 */
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  rightSidebarOpen: true,
  globalLoading: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  toggleRightSidebar: () => {
    set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen }));
  },

  setGlobalLoading: (loading: boolean) => {
    set({ globalLoading: loading });
  },

  showSnackbar: (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    set({ snackbar: { open: true, message, severity } });
  },

  closeSnackbar: () => {
    set((state) => ({ snackbar: { ...state.snackbar, open: false } }));
  },
}));
