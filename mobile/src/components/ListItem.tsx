import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { Text } from './Text';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
}

function Body({ title, subtitle, left, right }: Omit<ListItemProps, 'onPress'>) {
  return (
    <>
      {left ? <View>{left}</View> : null}
      <View style={styles.body}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </>
  );
}

export function ListItem({ onPress, ...rest }: ListItemProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <Body {...rest} />
      </Pressable>
    );
  }
  return (
    <View style={styles.row}>
      <Body {...rest} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  pressed: {
    backgroundColor: colors.muted,
  },
  body: {
    flex: 1,
    gap: 2,
  },
});
