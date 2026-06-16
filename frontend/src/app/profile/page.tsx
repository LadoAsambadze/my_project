'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, MapPinIcon, MailIcon, PencilIcon } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { RequireAuth } from '@/components/require-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  initialsFrom,
} from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EditProfileDialog } from './edit-profile-dialog';

function ProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10">
      <Skeleton className="h-36 w-full rounded-xl sm:h-44" />
      <div className="-mt-12 px-2 sm:px-6">
        <Skeleton className="size-24 rounded-full ring-4 ring-background" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full max-w-md" />
        </div>
      </div>
    </main>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);

  // Ensure the freshest profile when landing on the page (e.g. after a hard
  // reload). Errors are non-fatal — context already holds a usable user.
  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  if (!user) return null;

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-10">
      <Card className="overflow-hidden p-0">
        {/* Cover band */}
        <div className="relative h-36 w-full bg-gradient-to-br from-primary via-primary/80 to-accent sm:h-44">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
        </div>

        <CardContent className="px-4 pb-6 sm:px-6">
          {/* Avatar overlapping the cover + edit action */}
          <div className="-mt-12 flex items-end justify-between gap-4 sm:-mt-14">
            <Avatar className="size-24 ring-4 ring-card sm:size-28">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name ?? ''} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {initialsFrom(user.name, user.email)}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="mb-1"
            >
              <PencilIcon />
              Edit profile
            </Button>
          </div>

          {/* Identity */}
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight">
                {user.name?.trim() || 'Unnamed'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MailIcon className="size-3.5" />
                  {user.email}
                </span>
                {user.location?.trim() ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPinIcon className="size-3.5" />
                    {user.location}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="size-3.5" />
                  Member since {joined}
                </span>
              </div>
            </div>

            {user.bio?.trim() ? (
              <p className="text-sm leading-relaxed text-foreground/90">
                {user.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No bio yet.{' '}
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:underline"
                >
                  Add one
                </button>
                .
              </p>
            )}

            {!user.location?.trim() ? (
              <Badge variant="outline" className="font-normal">
                Location not set
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <EditProfileDialog
        user={user}
        open={editing}
        onOpenChange={setEditing}
      />
    </main>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </RequireAuth>
  );
}
