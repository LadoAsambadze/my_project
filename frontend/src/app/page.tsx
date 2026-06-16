'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  CalendarHeartIcon,
  FlowerIcon,
  MailIcon,
  SparklesIcon,
} from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-context';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';

const FEATURES = [
  {
    icon: CalendarHeartIcon,
    title: 'Plan parties',
    body: 'Build the guest list, set the date, and keep every detail in one place.',
  },
  {
    icon: FlowerIcon,
    title: 'Order flowers',
    body: 'Pick arrangements that match the moment and have them delivered on time.',
  },
  {
    icon: MailIcon,
    title: 'Send invitations',
    body: 'Craft beautiful invitation letters and share them in a couple of taps.',
  },
];

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="flex flex-1 flex-col">
      {/* Lightweight top bar for the public landing. */}
      <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <span className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          Event
        </span>
        <ThemeToggle />
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/60 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <Badge variant="secondary" className="gap-1.5">
            <SparklesIcon className="size-3" />
            Parties, flowers &amp; invitations
          </Badge>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            Every celebration,{' '}
            <span className="text-primary">beautifully planned.</span>
          </h1>
          <p className="max-w-xl text-base text-muted-foreground text-pretty sm:text-lg">
            Event brings your parties, flowers, and invitation letters together
            in one calm, organized place — so you can focus on the moment.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row">
            {loading ? (
              <div
                aria-hidden
                className="h-9 w-40 animate-pulse rounded-lg bg-muted"
              />
            ) : user ? (
              <Link
                href="/dashboard"
                className={buttonVariants({ size: 'lg', className: 'px-5' })}
              >
                Go to dashboard
                <ArrowRightIcon />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className={buttonVariants({ size: 'lg', className: 'px-5' })}
                >
                  Get started
                  <ArrowRightIcon />
                </Link>
                <Link
                  href="/login"
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'lg',
                    className: 'px-5',
                  })}
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="h-full">
              <CardContent className="flex flex-col gap-3 py-2">
                <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
