"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOutIcon, UserIcon, SparklesIcon } from "lucide-react"

import { useAuth } from "@/lib/auth/auth-context"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  initialsFrom,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export function AppBar() {
  const router = useRouter()
  const { user, logout } = useAuth()

  async function onLogout() {
    try {
      await logout()
      toast.success("Signed out")
      router.replace("/login")
    } catch {
      toast.error("Could not sign out")
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href={user ? "/dashboard" : "/"}
          className="flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          <span className="text-base">Event</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Avatar className="size-8">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name ?? ""} />
                  ) : null}
                  <AvatarFallback>
                    {initialsFrom(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel className="truncate">
                  {user.name?.trim() || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link href="/profile" />}
                >
                  <UserIcon />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogOutIcon />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  )
}
