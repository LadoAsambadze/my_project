'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';
import { registerSchema, type RegisterValues } from '@/lib/validation/schemas';
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

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  async function onSubmit(values: RegisterValues) {
    try {
      await registerUser(
        values.email,
        values.password,
        values.name?.trim() || undefined,
      );
      toast.success('Account created!');
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    }
  }

  return (
    <AuthShell>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Start planning your events.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            <FormField
              id="name"
              label="Name"
              error={errors.name?.message}
              helper="Optional — how you'll appear on Event."
            >
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Ada Lovelace"
                aria-invalid={!!errors.name}
                aria-describedby={fieldDescribedBy(
                  'name',
                  errors.name?.message,
                  "Optional — how you'll appear on Event.",
                )}
                {...register('name')}
              />
            </FormField>

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
              helper="At least 8 characters."
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                aria-describedby={fieldDescribedBy(
                  'password',
                  errors.password?.message,
                  'At least 8 characters.',
                )}
                {...register('password')}
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? 'Creating account…' : 'Sign up'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </CardContent>
        </form>
      </Card>
    </AuthShell>
  );
}
