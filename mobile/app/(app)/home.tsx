import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Avatar,
  Button,
  Card,
  Text,
  useToast,
} from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function Home() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const displayName = user?.name?.trim() || user?.email || 'there';

  async function onLogout() {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Signed out');
    } catch {
      toast.error('Could not sign out');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Event</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile"
          onPress={() => router.push('/(app)/profile')}
          hitSlop={8}
        >
          <Avatar name={displayName} uri={user?.avatarUrl} size="md" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="title">Hi, {displayName} 👋</Text>
        <Text variant="body" tone="muted" style={styles.signedInAs}>
          Signed in as {user?.email}
        </Text>

        {/* Placeholder feed cards. These become the real social feed once the
            backend grows posts/friends. */}
        {PLACEHOLDER_FEED.map((item) => (
          <Card key={item.title} elevated style={styles.card}>
            <Text variant="bodyStrong">{item.title}</Text>
            <Text variant="body" tone="muted" style={styles.cardBody}>
              {item.body}
            </Text>
          </Card>
        ))}

        <View style={styles.actions}>
          <Button
            title="View profile"
            variant="secondary"
            onPress={() => router.push('/(app)/profile')}
          />
          <View style={styles.gap} />
          <Button
            title="View design system"
            variant="ghost"
            onPress={() => router.push('/(app)/design-system')}
          />
          <View style={styles.gap} />
          <Button
            title="Log out"
            variant="ghost"
            onPress={onLogout}
            loading={loggingOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const PLACEHOLDER_FEED = [
  {
    title: 'Your feed is coming soon',
    body: 'Posts from friends, event updates, and invitations will show up here.',
  },
  {
    title: 'Find friends',
    body: 'Connect with people to plan events together.',
  },
  {
    title: 'Create your first event',
    body: 'Parties, flowers, invitations — start planning in a few taps.',
  },
];

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  feed: {
    padding: spacing.lg,
  },
  signedInAs: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardBody: {
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.md,
  },
  gap: {
    height: spacing.sm,
  },
});
