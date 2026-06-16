'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';
import { loginSchema, type LoginValues } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { FormField, fieldDescribedBy } from '@/components/ui/form-field';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AuthShell } from '@/components/auth-shell';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  async function onSubmit(values: LoginValues) {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <AuthShell>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Log in</CardTitle>
          <CardDescription>Welcome back to Event.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={fieldDescribedBy('email', errors.email?.message)}
                {...register('email')}
              />
            </FormField>

            <FormField
              id="password"
              label="Password"
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={fieldDescribedBy(
                  'password',
                  errors.password?.message,
                )}
                {...register('password')}
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              No account?{' '}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </AuthShell>
  );
}
