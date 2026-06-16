import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';
import { GraphQLRequestError } from '@/lib/graphql/client';
import {
  validateName,
  validateBio,
  validateLocation,
  validateAvatarUrl,
  runValidators,
} from '@/lib/validation';
import {
  Avatar,
  Button,
  Field,
  Text,
  Textarea,
  useToast,
} from '@/components/ui';
import type { UpdateProfileInput } from '@/lib/graphql/operations';
import { colors, spacing } from '@/theme';

interface FieldErrors {
  name?: string;
  bio?: string;
  location?: string;
  avatarUrl?: string;
}

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [location, setLocation] = useState(user?.location ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const clearError = (key: keyof FieldErrors) =>
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  // Send only the fields that actually changed. An empty string is meaningful
  // (it clears the field on the backend), so compare trimmed values against the
  // current user rather than unconditionally sending everything.
  function buildInput(): UpdateProfileInput {
    const input: UpdateProfileInput = {};
    const next = {
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl: avatarUrl.trim(),
    };
    if (next.name !== (user?.name ?? '')) input.name = next.name;
    if (next.bio !== (user?.bio ?? '')) input.bio = next.bio;
    if (next.location !== (user?.location ?? '')) input.location = next.location;
    if (next.avatarUrl !== (user?.avatarUrl ?? ''))
      input.avatarUrl = next.avatarUrl;
    return input;
  }

  async function onSave() {
    const { valid, errors: nextErrors } = runValidators({
      name: () => validateName(name),
      bio: () => validateBio(bio),
      location: () => validateLocation(location),
      avatarUrl: () => validateAvatarUrl(avatarUrl),
    });
    setErrors(nextErrors);
    if (!valid) return;

    const input = buildInput();
    if (Object.keys(input).length === 0) {
      toast.info('No changes to save');
      router.back();
      return;
    }

    setSubmitting(true);
    try {
      await updateProfile(input);
      toast.success('Profile updated');
      router.back();
    } catch (e) {
      toast.error(
        e instanceof GraphQLRequestError ? e.message : 'Could not save profile',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const previewName = name.trim() || user?.email || 'You';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Button
          title="Cancel"
          variant="ghost"
          size="sm"
          fullWidth={false}
          onPress={() => router.back()}
          disabled={submitting}
        />
        <Text variant="bodyStrong">Edit profile</Text>
        <Button
          title="Save"
          size="sm"
          fullWidth={false}
          onPress={onSave}
          loading={submitting}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarPreview}>
            <Avatar
              name={previewName}
              uri={avatarUrl.trim() && !errors.avatarUrl ? avatarUrl.trim() : null}
              size="xl"
            />
          </View>

          <Field
            label="Name"
            value={name}
            onChangeText={(t) => {
              setName(t);
              clearError('name');
            }}
            error={errors.name}
            counterMax={80}
            autoCapitalize="words"
            placeholder="Your name"
          />
          <Textarea
            label="Bio"
            value={bio}
            onChangeText={(t) => {
              setBio(t);
              clearError('bio');
            }}
            error={errors.bio}
            counterMax={280}
            placeholder="Tell people about yourself"
          />
          <Field
            label="Location"
            value={location}
            onChangeText={(t) => {
              setLocation(t);
              clearError('location');
            }}
            error={errors.location}
            counterMax={120}
            placeholder="City, Country"
          />
          <Field
            label="Avatar URL"
            value={avatarUrl}
            onChangeText={(t) => {
              setAvatarUrl(t);
              clearError('avatarUrl');
            }}
            onBlur={() =>
              setErrors((e) => ({
                ...e,
                avatarUrl: validateAvatarUrl(avatarUrl) ?? undefined,
              }))
            }
            error={errors.avatarUrl}
            helper="Optional. A public http(s) image link."
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://…"
          />

          <Button
            title="Save changes"
            onPress={onSave}
            loading={submitting}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    padding: spacing.lg,
  },
  avatarPreview: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});
