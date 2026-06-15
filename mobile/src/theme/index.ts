// Public theme entry point. Values come from tokens.generated.ts, which is
// generated from design/tokens.json — edit tokens there, not here.
import {
  darkColors,
  lightColors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
  shadow,
  type ColorScheme,
} from './tokens.generated';

// The app is dark-mode first for now. To support a theme toggle later, expose
// `scheme` selection here and thread it through a context.
const scheme: ColorScheme = darkColors;

export const colors = {
  ...scheme,
  // Convenience aliases kept for the first auth screens.
  surface: scheme.card,
  text: scheme.foreground,
  textMuted: scheme.mutedForeground,
  primaryText: scheme.primaryForeground,
  danger: scheme.destructive,
};

export const typography = { fontSize, fontWeight, lineHeight, fontFamily };

export { spacing, radius, shadow, lightColors, darkColors };
export type { ColorScheme };
