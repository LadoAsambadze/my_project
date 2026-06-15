'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { buttonVariants } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Event</h1>
        <p className="text-muted-foreground max-w-md">
          Plan parties, flowers and invitation letters — all in one place.
        </p>
      </div>

      <div className="flex gap-3">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : user ? (
          <Link href="/dashboard" className={buttonVariants()}>
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link href="/register" className={buttonVariants()}>
              Get started
            </Link>
            <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
              Log in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
