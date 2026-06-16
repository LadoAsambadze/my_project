import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Skeleton,
  Text,
} from '@/components/ui';
import { colors, radius, spacing } from '@/theme';

function formatMemberSince(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });
}

function ProfileSkeleton() {
  return (
    <View style={styles.body}>
      <View style={styles.avatarWrap}>
        <Skeleton circle width={104} height={104} style={styles.avatarRing} />
      </View>
      <View style={styles.identity}>
        <Skeleton width={180} height={28} />
        <View style={styles.skelGap} />
        <Skeleton width={140} height={16} />
      </View>
      <Card style={styles.section}>
        <Skeleton width="40%" height={14} />
        <View style={styles.skelGap} />
        <Skeleton width="100%" height={16} />
        <View style={styles.skelGap} />
        <Skeleton width="80%" height={16} />
      </Card>
    </View>
  );
}

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const displayName = user?.name?.trim() || user?.email || 'Your profile';
  const memberSince = formatMemberSince(user?.createdAt);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <Button
          title="Back"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
        />
        {!loading && user ? (
          <Button
            title="Edit"
            size="sm"
            fullWidth={false}
            onPress={() => router.push('/(app)/edit-profile')}
          />
        ) : (
          <View />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Netflix-style immersive hero band (brand-tinted surface). */}
        <View style={styles.hero}>
          <View style={styles.heroOverlay} />
        </View>

        {loading || !user ? (
          <ProfileSkeleton />
        ) : (
          <View style={styles.body}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                <Avatar name={displayName} uri={user.avatarUrl} size="xl" />
              </View>
            </View>

            <View style={styles.identity}>
              <Text variant="title">{displayName}</Text>
              {user.location ? (
                <Text variant="body" tone="muted" style={styles.location}>
                  📍 {user.location}
                </Text>
              ) : null}
              <View style={styles.emailRow}>
                <Badge label="You" tone="primary" />
                <Text variant="caption" tone="muted">
                  {user.email}
                </Text>
              </View>
            </View>

            <Card style={styles.section}>
              <Text variant="label" tone="muted" style={styles.sectionLabel}>
                ABOUT
              </Text>
              {user.bio ? (
                <Text variant="body">{user.bio}</Text>
              ) : (
                <Text variant="body" tone="muted">
                  No bio yet. Tap Edit to tell people about yourself.
                </Text>
              )}
              {memberSince ? (
                <>
                  <Divider />
                  <Text variant="caption" tone="muted">
                    Member since {memberSince}
                  </Text>
                </>
              ) : null}
            </Card>

            <Button
              title="Edit profile"
              variant="secondary"
              onPress={() => router.push('/(app)/edit-profile')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const HERO_HEIGHT = 140;
const AVATAR_OVERLAP = 52;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 2,
  },
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accent,
    opacity: 0.35,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  avatarWrap: {
    marginTop: -AVATAR_OVERLAP,
    alignItems: 'flex-start',
  },
  avatarRing: {
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: colors.background,
  },
  identity: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  location: {
    marginTop: spacing.xs / 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionLabel: {
    letterSpacing: 1,
  },
  skelGap: {
    height: spacing.sm,
  },
});
