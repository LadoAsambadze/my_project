'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useAuth } from '@/lib/auth/auth-context';
import type { AuthUser, UpdateProfileInput } from '@/lib/graphql/operations';
import { profileSchema, type ProfileValues } from '@/lib/validation/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { FormField, fieldDescribedBy } from '@/components/ui/form-field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';

function toFormValues(user: AuthUser): ProfileValues {
  return {
    name: user.name ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    avatarUrl: user.avatarUrl ?? '',
  };
}

/**
 * Build the mutation input, sending only changed fields. An empty string is a
 * meaningful value (it clears the field on the backend), so we compare against
 * the current user rather than dropping blanks.
 */
function buildInput(values: ProfileValues, user: AuthUser): UpdateProfileInput {
  const input: UpdateProfileInput = {};
  // Compare the trimmed value we'd actually send, so a whitespace-only edit
  // isn't treated as a change (and a real change isn't sent untrimmed).
  const next = {
    name: values.name.trim(),
    bio: values.bio.trim(),
    location: values.location.trim(),
    avatarUrl: values.avatarUrl.trim(),
  };
  if (next.name !== (user.name ?? '')) input.name = next.name;
  if (next.bio !== (user.bio ?? '')) input.bio = next.bio;
  if (next.location !== (user.location ?? '')) input.location = next.location;
  if (next.avatarUrl !== (user.avatarUrl ?? ''))
    input.avatarUrl = next.avatarUrl;
  return input;
}

export function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AuthUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { updateProfile } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(user),
  });

  // Re-seed the form whenever the dialog opens or the user changes.
  useEffect(() => {
    if (open) {
      reset(toFormValues(user));
      setServerError(null);
    }
  }, [open, user, reset]);

  const bioValue = watch('bio') ?? '';

  async function onSubmit(values: ProfileValues) {
    const input = buildInput(values, user);
    if (Object.keys(input).length === 0) {
      toast.info('No changes to save');
      onOpenChange(false);
      return;
    }
    setServerError(null);
    try {
      await updateProfile(input);
      toast.success('Profile updated');
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not update profile';
      setServerError(message);
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update how you appear across Event.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField id="name" label="Name" error={errors.name?.message}>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Lovelace"
              aria-invalid={!!errors.name}
              aria-describedby={fieldDescribedBy('name', errors.name?.message)}
              {...register('name')}
            />
          </FormField>

          <FormField
            id="bio"
            label="Bio"
            error={errors.bio?.message}
            labelAddon={`${bioValue.length}/280`}
          >
            <Textarea
              id="bio"
              rows={3}
              placeholder="A little about you…"
              aria-invalid={!!errors.bio}
              aria-describedby={fieldDescribedBy('bio', errors.bio?.message)}
              {...register('bio')}
            />
          </FormField>

          <FormField
            id="location"
            label="Location"
            error={errors.location?.message}
          >
            <Input
              id="location"
              type="text"
              autoComplete="address-level2"
              placeholder="London, UK"
              aria-invalid={!!errors.location}
              aria-describedby={fieldDescribedBy(
                'location',
                errors.location?.message,
              )}
              {...register('location')}
            />
          </FormField>

          <FormField
            id="avatarUrl"
            label="Avatar URL"
            error={errors.avatarUrl?.message}
            helper="Link to an image (http or https)."
          >
            <Input
              id="avatarUrl"
              type="url"
              inputMode="url"
              placeholder="https://…"
              aria-invalid={!!errors.avatarUrl}
              aria-describedby={fieldDescribedBy(
                'avatarUrl',
                errors.avatarUrl?.message,
                'Link to an image (http or https).',
              )}
              {...register('avatarUrl')}
            />
          </FormField>

          {serverError ? (
            <p role="alert" className="text-sm font-medium text-destructive">
              {serverError}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose
              render={
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              }
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
