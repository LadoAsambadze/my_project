import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';
import { Text } from './Text';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, { bg: string; fg: string }> = {
  neutral: { bg: colors.muted, fg: colors.mutedForeground },
  primary: { bg: colors.accent, fg: colors.accentForeground },
  success: { bg: colors.success, fg: colors.successForeground },
  warning: { bg: colors.warning, fg: colors.warningForeground },
  danger: { bg: colors.destructive, fg: colors.destructiveForeground },
};

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text
        style={{
          color: t.fg,
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.full,
  },
});
