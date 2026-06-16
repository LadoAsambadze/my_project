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
  validateLoginPassword,
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
  email?: string;
  password?: string;
}

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    const { valid, errors: nextErrors } = runValidators({
      email: () => validateEmail(email),
      password: () => validateLoginPassword(password),
    });
    setErrors(nextErrors);
    if (!valid) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back!');
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
        <Heading>Welcome back</Heading>
        <Subtle>Log in to keep planning.</Subtle>

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
          autoComplete="password"
          placeholder="Your password"
        />

        <Button title="Log in" onPress={onSubmit} loading={submitting} />

        <Pressable
          style={styles.switch}
          onPress={() => router.replace('/(auth)/register')}
        >
          <Text style={styles.switchText}>
            New here? <Text style={styles.switchLink}>Create an account</Text>
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
