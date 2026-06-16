"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

const DropdownMenu = MenuPrimitive.Root
const DropdownMenuTrigger = MenuPrimitive.Trigger

function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup> & {
  sideOffset?: number
  align?: "start" | "center" | "end"
}) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner sideOffset={sideOffset} align={align}>
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 min-w-44 origin-[var(--transform-origin)] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 transition-all duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(
        "flex cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-sm outline-none select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.GroupLabel>) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      className={cn("px-2.5 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
