'use client';

import Link from 'next/link';
import {
  CalendarHeartIcon,
  FlowerIcon,
  MailIcon,
  PlusIcon,
  UserIcon,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { RequireAuth } from '@/components/require-auth';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  initialsFrom,
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const QUICK_ACTIONS = [
  {
    icon: CalendarHeartIcon,
    title: 'New party',
    body: 'Set a date and start a guest list.',
  },
  {
    icon: FlowerIcon,
    title: 'Order flowers',
    body: 'Browse arrangements for the occasion.',
  },
  {
    icon: MailIcon,
    title: 'Write invitations',
    body: 'Draft and send invitation letters.',
  },
];

function DashboardSkeleton() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </main>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  if (!user) return null;

  const greetingName = user.name?.trim().split(/\s+/)[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-6">
      {/* Welcome card */}
      <Card>
        <CardContent className="flex items-center gap-4 py-2">
          <Avatar className="size-14">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name ?? ''} />
            ) : null}
            <AvatarFallback className="text-lg">
              {initialsFrom(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">
              Welcome back{greetingName ? `, ${greetingName}` : ''}!
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {user.location?.trim() || user.email}
            </p>
          </div>
          <Link
            href="/profile"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <UserIcon />
            Profile
          </Link>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        {QUICK_ACTIONS.map(({ icon: Icon, title, body }) => (
          <Card key={title} className="h-full">
            <CardContent className="flex flex-col gap-2 py-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="size-4.5" />
              </span>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feed shell — empty state */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Your feed</CardTitle>
            <CardDescription>
              Events and updates will appear here.
            </CardDescription>
          </div>
          <Badge variant="secondary">Coming soon</Badge>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <CalendarHeartIcon className="size-6" />
            </span>
            <div className="space-y-1">
              <p className="text-sm font-medium">Nothing here yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first event to get started.
              </p>
            </div>
            <span className={buttonVariants({ size: 'sm' })}>
              <PlusIcon />
              New event
            </span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </RequireAuth>
  );
}
