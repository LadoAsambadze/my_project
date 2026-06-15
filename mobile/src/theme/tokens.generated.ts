// AUTO-GENERATED from design/tokens.json — do not edit. Run `node design/generate.mjs`.

export const lightColors = {
    background: '#ffffff',
    foreground: '#0b0b0f',
    card: '#ffffff',
    cardForeground: '#0b0b0f',
    popover: '#ffffff',
    popoverForeground: '#0b0b0f',
    primary: '#6d5dfc',
    primaryForeground: '#ffffff',
    secondary: '#ececef',
    secondaryForeground: '#16161d',
    muted: '#ececef',
    mutedForeground: '#6b6b7b',
    accent: '#f3f1ff',
    accentForeground: '#4a36b8',
    success: '#16a34a',
    successForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#0b0b0f',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#d9d9e0',
    input: '#d9d9e0',
    ring: '#6d5dfc',
    sidebar: '#f7f7f8',
    sidebarForeground: '#0b0b0f',
    sidebarPrimary: '#6d5dfc',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#ececef',
    sidebarAccentForeground: '#16161d',
    sidebarBorder: '#d9d9e0',
    sidebarRing: '#6d5dfc',
    chart1: '#6d5dfc',
    chart2: '#3b82f6',
    chart3: '#22c55e',
    chart4: '#f59e0b',
    chart5: '#ef4444',
} as const;

export const darkColors = {
    background: '#0b0b0f',
    foreground: '#f7f7f8',
    card: '#16161d',
    cardForeground: '#f7f7f8',
    popover: '#16161d',
    popoverForeground: '#f7f7f8',
    primary: '#6d5dfc',
    primaryForeground: '#ffffff',
    secondary: '#2a2a35',
    secondaryForeground: '#f7f7f8',
    muted: '#2a2a35',
    mutedForeground: '#8e8e9e',
    accent: '#2a2a35',
    accentForeground: '#f7f7f8',
    success: '#22c55e',
    successForeground: '#0b0b0f',
    warning: '#f59e0b',
    warningForeground: '#0b0b0f',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#2a2a35',
    input: '#2a2a35',
    ring: '#6d5dfc',
    sidebar: '#16161d',
    sidebarForeground: '#f7f7f8',
    sidebarPrimary: '#6d5dfc',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#2a2a35',
    sidebarAccentForeground: '#f7f7f8',
    sidebarBorder: '#2a2a35',
    sidebarRing: '#6d5dfc',
    chart1: '#9279ff',
    chart2: '#3b82f6',
    chart3: '#22c55e',
    chart4: '#f59e0b',
    chart5: '#ef4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const radius = {
  base: 10,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.65,
} as const;

export const fontFamily = {
  sans: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

export const shadow = {
  sm: { shadowColor: '#000000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  md: { shadowColor: '#000000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  lg: { shadowColor: '#000000', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 8 },
} as const;

export type ColorScheme = { [K in keyof typeof lightColors]: string };
