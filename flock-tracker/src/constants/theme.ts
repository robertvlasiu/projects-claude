export const colors = {
  primary: '#F59E0B',
  primaryDark: '#D97706',
  primaryLight: '#FEF3C7',
  secondary: '#6B9E78',
  secondaryDark: '#4D7A59',
  secondaryLight: '#D1FAE5',
  background: '#FFFBF0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF8E7',
  text: '#1C1917',
  textSecondary: '#78716C',
  textMuted: '#A8A29E',
  border: '#E7E5E4',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  healthColors: {
    checkup: '#22C55E',
    illness: '#EF4444',
    treatment: '#3B82F6',
    observation: '#8B5CF6',
    death: '#6B7280',
  } as Record<string, string>,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const font = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};
