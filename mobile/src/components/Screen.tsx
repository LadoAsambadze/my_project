import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';
import { Text } from './Text';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  contentStyle,
}: ScreenProps) {
  const inner = padded ? styles.padded : undefined;

  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, inner, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, inner, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

// Simple error line, kept for the first auth screens.
export function ErrorText({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <Text variant="caption" tone="danger" style={{ marginBottom: spacing.md }}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    padding: spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
