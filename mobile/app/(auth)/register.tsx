import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';
import { GraphQLRequestError } from '@/lib/graphql/client';
import {
  validateEmail,
  validateName,
  validateRegisterPassword,
  runValidators,
} from '@/lib/validation';
import {
  Button,
  Field,
  Heading,
  Screen,
  Subtle,
  useToast,
} from '@/components/ui';
import { colors, spacing } from '@/theme';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    const { valid, errors: nextErrors } = runValidators({
      name: () => validateName(name),
      email: () => validateEmail(email),
      password: () => validateRegisterPassword(password),
    });
    setErrors(nextErrors);
    if (!valid) return;

    setSubmitting(true);
    try {
      await register(email.trim(), password, name.trim());
      toast.success('Account created!');
      // The root auth gate handles navigation into the app.
    } catch (e) {
      toast.error(
        e instanceof GraphQLRequestError ? e.message : 'Something went wrong',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Heading>Create your account</Heading>
        <Subtle>It only takes a moment.</Subtle>

        <Field
          label="Name"
          value={name}
          onChangeText={(t) => {
            setName(t);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          error={errors.name}
          autoCapitalize="words"
          autoComplete="name"
          placeholder="Your name"
        />
        <Field
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
          }}
          onBlur={() =>
            setErrors((e) => ({ ...e, email: validateEmail(email) ?? undefined }))
          }
          error={errors.email}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password)
              setErrors((e) => ({ ...e, password: undefined }));
          }}
          error={errors.password}
          secureTextEntry
          autoComplete="password-new"
          placeholder="At least 8 characters"
        />

        <Button title="Create account" onPress={onSubmit} loading={submitting} />

        <Pressable
          style={styles.switch}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.switchLink}>Log in</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  switch: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  switchText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
