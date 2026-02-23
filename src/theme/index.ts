// Theme System - Light & Dark Mode
// Used throughout the app for consistent theming

export const lightTheme = {
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  
  // Text
  text: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  // Primary brand color
  primary: '#1A5F5A',
  primaryLight: '#2D8B84',
  
  // Borders
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Status colors
  success: '#10B981',
  error: '#FF4444',
  warning: '#FF9800',
  
  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  tabBarActive: '#1A5F5A',
  tabBarInactive: '#999999',
  
  // Header
  headerBackground: '#1A5F5A',
  headerText: '#FFFFFF',
  
  // Misc
  placeholder: '#CCCCCC',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Shop brand colors (keep these constant)
  shopColors: {
    'IKEA': '#FFDA1C',
    'home24': '#FF6B6B',
    'Otto': '#FF6600',
    'XXXLutz': '#FF0000',
    'Westwing': '#2D2D2D',
    'Mömax': '#00A651',
    'Etsy': '#F56400',
  } as Record<string, string>,
};

export const darkTheme = {
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textMuted: '#888888',
  
  // Primary brand color (slightly lighter for dark mode)
  primary: '#2D8B84',
  primaryLight: '#3DA99D',
  
  // Borders
  border: '#333333',
  borderLight: '#444444',
  
  // Status colors (brighter for dark mode)
  success: '#34D399',
  error: '#FF6B6B',
  warning: '#FBBF24',
  
  // Tab bar
  tabBarBackground: '#1E1E1E',
  tabBarBorder: '#333333',
  tabBarActive: '#2D8B84',
  tabBarInactive: '#888888',
  
  // Header
  headerBackground: '#1E1E1E',
  headerText: '#FFFFFF',
  
  // Misc
  placeholder: '#666666',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Shop brand colors (keep these constant)
  shopColors: {
    'IKEA': '#FFDA1C',
    'home24': '#FF6B6B',
    'Otto': '#FF6600',
    'XXXLutz': '#FF0000',
    'Westwing': '#2D2D2D',
    'Mömax': '#00A651',
    'Etsy': '#F56400',
  } as Record<string, string>,
};

// Theme type
export type Theme = typeof lightTheme;

// Helper to check if theme is dark
export const isDarkTheme = (theme: Theme): boolean => {
  return theme.background === darkTheme.background;
};
