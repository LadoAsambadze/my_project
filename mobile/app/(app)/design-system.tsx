import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  Input,
  ListItem,
  Modal,
  Screen,
  Skeleton,
  Spinner,
  Text,
  Textarea,
  useToast,
} from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import type { TextVariant } from '@/components/ui';

const TEXT_VARIANTS: TextVariant[] = [
  'display',
  'title',
  'heading',
  'subtitle',
  'body',
  'bodyStrong',
  'label',
  'caption',
];

const SWATCHES: { name: string; value: string }[] = [
  { name: 'background', value: colors.background },
  { name: 'card', value: colors.card },
  { name: 'primary', value: colors.primary },
  { name: 'accent', value: colors.accent },
  { name: 'muted', value: colors.muted },
  { name: 'border', value: colors.border },
  { name: 'success', value: colors.success },
  { name: 'warning', value: colors.warning },
  { name: 'destructive', value: colors.destructive },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="label" tone="muted" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

export default function DesignSystem() {
  const router = useRouter();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="title">Design System</Text>
        <Button title="Done" variant="ghost" size="sm" fullWidth={false} onPress={() => router.back()} />
      </View>
      <Text variant="body" tone="muted" style={styles.intro}>
        Every token and component, live. Tell me what to change and I edit
        design/tokens.json — this screen updates with it.
      </Text>

      <Section title="Colors">
        <View style={styles.swatchGrid}>
          {SWATCHES.map((s) => (
            <View key={s.name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: s.value }]} />
              <Text variant="caption">{s.name}</Text>
              <Text variant="caption" tone="muted">{s.value}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typography">
        {TEXT_VARIANTS.map((v) => (
          <Text key={v} variant={v} style={styles.typeRow}>
            {v} — The quick brown fox
          </Text>
        ))}
      </Section>

      <Section title="Buttons">
        <Button title="Primary" onPress={() => {}} />
        <View style={styles.gap} />
        <Button title="Secondary" variant="secondary" onPress={() => {}} />
        <View style={styles.gap} />
        <Button title="Ghost" variant="ghost" onPress={() => {}} />
        <View style={styles.gap} />
        <Button title="Destructive" variant="destructive" onPress={() => {}} />
        <View style={styles.gap} />
        <Button title="Loading" loading onPress={() => {}} />
        <View style={styles.gap} />
        <View style={styles.row}>
          <Button title="sm" size="sm" fullWidth={false} onPress={() => {}} />
          <Button title="md" size="md" fullWidth={false} onPress={() => {}} />
          <Button title="lg" size="lg" fullWidth={false} onPress={() => {}} />
        </View>
      </Section>

      <Section title="Inputs">
        <Input label="Email" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="Password" placeholder="••••••••" secureTextEntry />
        <Input label="With error" placeholder="Invalid" error="That doesn't look right" />
        <Input label="With helper" placeholder="Optional" helper="We never share this." counterMax={80} value="" onChangeText={() => {}} />
        <Textarea label="Bio" placeholder="Tell people about yourself" counterMax={280} value="" onChangeText={() => {}} />
      </Section>

      <Section title="Feedback">
        <View style={styles.row}>
          <Spinner />
          <Spinner tone="muted" />
          <Spinner size="large" />
        </View>
        <View style={styles.gap} />
        <Skeleton width="60%" height={20} />
        <View style={styles.gap} />
        <Skeleton width="100%" height={16} />
        <View style={styles.gap} />
        <View style={styles.row}>
          <Button title="Toast success" variant="secondary" fullWidth={false} onPress={() => toast.success('Saved!')} />
          <Button title="Toast error" variant="secondary" fullWidth={false} onPress={() => toast.error('Something went wrong')} />
        </View>
      </Section>

      <Section title="Badges">
        <View style={styles.row}>
          <Badge label="Neutral" />
          <Badge label="Primary" tone="primary" />
          <Badge label="Success" tone="success" />
          <Badge label="Warning" tone="warning" />
          <Badge label="Danger" tone="danger" />
        </View>
      </Section>

      <Section title="Avatars">
        <View style={styles.row}>
          <Avatar name="Lado A" size="sm" />
          <Avatar name="Lado A" size="md" />
          <Avatar name="Lado A" size="lg" />
          <Avatar name="Lado A" size="xl" />
        </View>
      </Section>

      <Section title="Card & list">
        <Card elevated>
          <Text variant="bodyStrong">Card title</Text>
          <Text variant="body" tone="muted">
            Cards group related content with a subtle border and shadow.
          </Text>
          <Divider />
          <ListItem
            title="Lado Asambadze"
            subtitle="lado@example.com"
            left={<Avatar name="Lado Asambadze" />}
            right={<Badge label="You" tone="primary" />}
          />
          <ListItem
            title="Open a modal"
            subtitle="Tap to preview the Modal component"
            onPress={() => setModalOpen(true)}
          />
        </Card>
      </Section>

      <Section title="Tokens">
        <Text variant="caption" tone="muted">
          spacing: {Object.values(spacing).join(' · ')}
        </Text>
        <Text variant="caption" tone="muted">
          radius: {Object.values(radius).join(' · ')}
        </Text>
        <Text variant="caption" tone="muted">
          font sizes: {Object.values(typography.fontSize).join(' · ')}
        </Text>
      </Section>

      <Modal visible={modalOpen} onClose={() => setModalOpen(false)} title="Hello 👋">
        <Text variant="body" tone="muted">
          This is the Modal component. Tap outside or the button to close.
        </Text>
        <View style={styles.gap} />
        <Button title="Close" onPress={() => setModalOpen(false)} />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  intro: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  typeRow: {
    marginBottom: spacing.sm,
  },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchItem: {
    width: 96,
    gap: 2,
  },
  swatch: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gap: {
    height: spacing.sm,
  },
});
