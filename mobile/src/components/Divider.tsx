import { StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/theme';

export function Divider({ spacingY = spacing.md }: { spacingY?: number }) {
  return <View style={[styles.divider, { marginVertical: spacingY }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
});
