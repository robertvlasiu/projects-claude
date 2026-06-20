export const colors = {
  primary: '#D97706',
  primaryDark: '#B45309',
  primaryLight: '#FEF3C7',
  primaryMid: '#F59E0B',
  secondary: '#4D7A59',
  secondaryDark: '#3A5C44',
  secondaryLight: '#D1FAE5',
  background: '#FDFAF3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFF8E7',
  text: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',
  border: '#E7E5E4',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  headerBg: '#92400E',
  headerText: '#FFFFFF',
  healthColors: {
    checkup: '#16A34A',
    illness: '#DC2626',
    treatment: '#2563EB',
    observation: '#7C3AED',
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
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const font = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 21,
  xxl: 26,
  xxxl: 34,
};

export const shadow = {
  sm: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#1C1917',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
};
