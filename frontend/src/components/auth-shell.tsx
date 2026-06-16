"use client"

import * as React from "react"
import Link from "next/link"
import { SparklesIcon } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

/** Centered card layout on a subtle gradient, shared by login + register. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-svh flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-accent/50 via-background to-background" />
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 size-[32rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <header className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          Event
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  )
}
