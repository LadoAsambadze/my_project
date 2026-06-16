import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';
import { colors, typography } from '@/theme';

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subtitle'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption';

export type TextTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'danger'
  | 'onPrimary';

type VariantStyle = Pick<TextStyle, 'fontSize' | 'fontWeight' | 'lineHeight'>;

const { fontSize, fontWeight, lineHeight } = typography;

const VARIANTS: Record<TextVariant, VariantStyle> = {
  display: { fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['4xl'] * lineHeight.tight },
  title: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, lineHeight: fontSize['3xl'] * lineHeight.tight },
  heading: { fontSize: fontSize['2xl'], fontWeight: fontWeight.semibold, lineHeight: fontSize['2xl'] * lineHeight.snug },
  subtitle: { fontSize: fontSize.lg, fontWeight: fontWeight.regular, lineHeight: fontSize.lg * lineHeight.normal },
  body: { fontSize: fontSize.base, fontWeight: fontWeight.regular, lineHeight: fontSize.base * lineHeight.normal },
  bodyStrong: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, lineHeight: fontSize.base * lineHeight.normal },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: fontSize.sm * lineHeight.normal },
  caption: { fontSize: fontSize.xs, fontWeight: fontWeight.regular, lineHeight: fontSize.xs * lineHeight.normal },
};

const TONES: Record<TextTone, string> = {
  default: colors.foreground,
  muted: colors.mutedForeground,
  primary: colors.primary,
  danger: colors.danger,
  onPrimary: colors.primaryForeground,
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({
  variant = 'body',
  tone = 'default',
  style,
  ...props
}: TextProps) {
  return (
    <RNText style={[VARIANTS[variant], { color: TONES[tone] }, style]} {...props} />
  );
}

// Back-compat helpers used by the first auth screens.
export function Heading({ children }: { children: React.ReactNode }) {
  return <Text variant="title">{children}</Text>;
}

export function Subtle({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="subtitle" tone="muted">
      {children}
    </Text>
  );
}
