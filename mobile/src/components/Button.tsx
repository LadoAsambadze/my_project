import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const SIZES: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 40, paddingHorizontal: spacing.md, fontSize: typography.fontSize.sm },
  md: { height: 52, paddingHorizontal: spacing.lg, fontSize: typography.fontSize.base },
  lg: { height: 58, paddingHorizontal: spacing.lg, fontSize: typography.fontSize.lg },
};

const BG: Record<ButtonVariant, string> = {
  primary: colors.primary,
  secondary: colors.secondary,
  ghost: 'transparent',
  destructive: colors.destructive,
};

const FG: Record<ButtonVariant, string> = {
  primary: colors.primaryForeground,
  secondary: colors.secondaryForeground,
  ghost: colors.mutedForeground,
  destructive: colors.destructiveForeground,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth = true,
  style,
}: ButtonProps) {
  const s = SIZES[size];
  const blocked = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: BG[variant],
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        variant === 'ghost' && styles.ghostBorder,
        blocked && styles.disabled,
        pressed && !blocked && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={FG[variant]} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, { color: FG[variant], fontSize: s.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ghostBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
