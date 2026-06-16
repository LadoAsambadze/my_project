"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth/auth-context"
import { AppBar } from "@/components/app-bar"
import { Spinner } from "@/components/ui/spinner"

/**
 * Client-side route guard for authenticated pages. The access token lives in
 * localStorage (not a readable cookie), so protection happens here rather than
 * in middleware. Renders the AppBar + a fallback while auth resolves, and
 * redirects to /login when there is no session.
 */
export function RequireAuth({
  children,
  fallback,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const router = useRouter()
  const { user, loading } = useAuth()

  React.useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <>
        <AppBar />
        {fallback ?? (
          <main className="flex flex-1 items-center justify-center p-8">
            <Spinner className="size-6 text-muted-foreground" />
          </main>
        )}
      </>
    )
  }

  return (
    <>
      <AppBar />
      {children}
    </>
  )
}
