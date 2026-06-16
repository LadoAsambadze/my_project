import {
  ActivityIndicator,
  type ActivityIndicatorProps,
} from 'react-native';
import { colors } from '@/theme';

export type SpinnerTone = 'primary' | 'muted' | 'onPrimary';

const TONES: Record<SpinnerTone, string> = {
  primary: colors.primary,
  muted: colors.mutedForeground,
  onPrimary: colors.primaryForeground,
};

export interface SpinnerProps extends Omit<ActivityIndicatorProps, 'color'> {
  tone?: SpinnerTone;
}

/** ActivityIndicator wired to theme tokens. */
export function Spinner({ tone = 'primary', size = 'small', ...props }: SpinnerProps) {
  return <ActivityIndicator color={TONES[tone]} size={size} {...props} />;
}
