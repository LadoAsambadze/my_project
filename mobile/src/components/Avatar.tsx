import { Image, StyleSheet, View } from 'react-native';
import { colors, typography } from '@/theme';
import { Text } from './Text';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const DIMENSIONS: Record<AvatarSize, { size: number; fontSize: number }> = {
  sm: { size: 28, fontSize: typography.fontSize.xs },
  md: { size: 36, fontSize: typography.fontSize.sm },
  lg: { size: 48, fontSize: typography.fontSize.lg },
  xl: { size: 72, fontSize: typography.fontSize['2xl'] },
};

export interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: AvatarSize;
}

function initials(name?: string | null): string {
  const trimmed = name?.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, uri, size = 'md' }: AvatarProps) {
  const { size: dim, fontSize } = DIMENSIONS[size];
  const dimStyle = { width: dim, height: dim, borderRadius: dim / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.base, dimStyle]} />;
  }

  return (
    <View style={[styles.base, styles.fallback, dimStyle]}>
      <Text style={{ color: colors.primaryForeground, fontSize, fontWeight: typography.fontWeight.bold }}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.muted,
  },
  fallback: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
