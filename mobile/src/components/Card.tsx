import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, shadow, spacing } from '@/theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated, style, ...props }: CardProps) {
  return (
    <View
      style={[styles.card, elevated && shadow.md, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
