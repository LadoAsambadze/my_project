import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Heading, Screen, Subtle } from '@/components/ui';
import { colors, spacing } from '@/theme';

export default function Welcome() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.logo}>Event</Text>
        <Heading>Plan it together.</Heading>
        <Subtle>
          Events, parties, flowers and invitations — all in one place.
        </Subtle>
      </View>
      <View style={styles.actions}>
        <Button title="Get started" onPress={() => router.push('/(auth)/register')} />
        <View style={{ height: spacing.sm }} />
        <Button
          title="I already have an account"
          variant="ghost"
          onPress={() => router.push('/(auth)/login')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.lg,
  },
  actions: {
    paddingBottom: spacing.md,
  },
});
