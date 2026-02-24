// Furniq Theme - "Apple Skeleton, Pinterest Soul"
// Complete redesign based on DESIGN_SYSTEM.md

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========== COLOR PALETTE ==========
export const colors = {
  // Light Mode
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F7', // Apple System Gray 6
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    
    text: '#000000',
    textSecondary: 'rgba(60, 60, 67, 0.6)', // Apple secondaryLabel
    textTertiary: 'rgba(60, 60, 67, 0.3)',
    
    accent: '#1A5F5A', // Furniq Teal
    accentLight: '#E8F5F3',
    accentPressed: '#145048',
    
    separator: 'rgba(60, 60, 67, 0.12)',
    separatorOpaque: '#C6C6C8',
    
    destructive: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
  
  // Dark Mode
  dark: {
    background: '#000000', // Apple true black
    surface: '#1C1C1E', // Apple secondarySystemBackground
    card: '#2C2C2E', // Apple tertiarySystemBackground
    elevated: '#2C2C2E',
    
    text: '#FFFFFF',
    textSecondary: 'rgba(235, 235, 245, 0.6)',
    textTertiary: 'rgba(235, 235, 245, 0.3)',
    
    accent: '#2DD4BF', // Teal aufgehellt für Dark
    accentLight: '#1A3A36',
    accentPressed: '#5EEAD4',
    
    separator: 'rgba(84, 84, 88, 0.6)',
    separatorOpaque: '#38383A',
    
    destructive: '#FF453A',
    success: '#30D158',
    warning: '#FF9F0A',
  },
};

// Shop brand colors (constant across modes)
export const shopColors: Record<string, string> = {
  'IKEA': '#FFDA1C',
  'home24': '#FF6B6B',
  'Otto': '#FF6600',
  'XXXLutz': '#FF0000',
  'Westwing': '#2D2D2D',
  'Mömax': '#00A651',
  'Etsy': '#F56400',
  'Amazon': '#FF9900',
};

// ========== TYPOGRAPHY ==========
export const typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
    lineHeight: 13,
  },
};

// ========== SPACING (8pt Grid) ==========
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  
  // Screen padding
  screenHorizontal: 16,
  screenHorizontalLarge: 20,
  
  // Card padding
  cardPadding: 16,
  
  // Section spacing
  sectionSpacing: 32,
};

// ========== BORDER RADIUS ==========
export const borderRadius = {
  small: 8, // Badges, Tags
  medium: 12, // Cards, Buttons
  large: 16, // Modal, Bottom Sheet
  full: 9999, // Pills, round buttons
};

// ========== SHADOWS ==========
export const shadows = {
  // Subtle Card Shadow (Apple-Style)
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  // Elevated Card (Hover/Pressed State, Floating Elements)
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  // Modal/Sheet Shadow
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ========== LAYOUT ==========
export const layout = {
  screenWidth: SCREEN_WIDTH,
  maxContentWidth: 400,
  
  // Grid
  gridColumns: 2,
  gridGutter: 12,
  
  // Product Card
  productCardRatio: 1, // 1:1 square images
  
  // Tab Bar
  tabBarHeight: 83, // iOS tab bar with safe area
};

// ========== THEME CREATION ==========
export type ThemeMode = 'light' | 'dark' | 'system';

export const createTheme = (mode: 'light' | 'dark') => {
  const palette = colors[mode];
  const isDark = mode === 'dark';
  
  return {
    // Colors (backward compatible)
    background: palette.background,
    surface: palette.surface,
    card: palette.card,
    elevated: palette.elevated,
    
    text: palette.text,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    textMuted: palette.textTertiary,
    
    primary: palette.accent,
    primaryLight: palette.accentLight,
    primaryPressed: palette.accentPressed,
    
    border: palette.separatorOpaque,
    borderLight: palette.separator,
    
    error: palette.destructive,
    success: palette.success,
    warning: palette.warning,
    
    // Header/Tab (backward compatible)
    headerBackground: palette.card,
    headerText: palette.text,
    tabBarBackground: isDark ? '#1C1C1E' : '#FFFFFF',
    tabBarBorder: palette.separator,
    tabBarActive: palette.accent,
    tabBarInactive: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    
    // Misc
    placeholder: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
    overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    
    // Shop colors
    shopColors,
    
    // Theme info
    isDark,
    mode,
  };
};

// Theme types
export type Theme = ReturnType<typeof createTheme>;

// ========== DEFAULT THEMES ==========
export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');

// Helper to check theme
export const isDarkTheme = (theme: Theme): boolean => theme.isDark;
