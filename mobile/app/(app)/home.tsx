import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

export default function Home() {
  const { user, logout } = useAuth();
  const displayName = user?.name?.trim() || user?.email || 'there';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>Event</Text>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.feed}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>Hi, {displayName} 👋</Text>
        <Text style={styles.signedInAs}>Signed in as {user?.email}</Text>

        {/* Placeholder feed cards. These become the real social feed once the
            backend grows posts/friends. */}
        {PLACEHOLDER_FEED.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>{item.body}</Text>
          </View>
        ))}

        <View style={styles.logoutWrap}>
          <Button title="Log out" variant="ghost" onPress={logout} />
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryText,
    fontSize: 16,
    fontWeight: '700',
  },
  feed: {
    padding: spacing.lg,
  },
  greeting: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  signedInAs: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  logoutWrap: {
    marginTop: spacing.md,
  },
});
