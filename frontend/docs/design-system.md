# Event Design System

Brand: **Premium Purple** — a deep violet primary `#7C3AED` (white text) on clean
cool neutrals with a subtle violet tint, plus a luxe gold accent `#F59E0B`, for
the events marketplace (designs, flowers, lights, songs, singers, invitations,
parties). A `.gradient-text` utility provides the signature violet gradient for
emphasis.

Live reference: run the app and open **`/en/design-system`** — it renders every
token and element on one page.

## Tokens

All colors are semantic CSS variables in [globals.css](../src/app/globals.css),
stored as HSL triplets and consumed via `hsl(var(--token))`. Light theme is on
`:root`, dark theme on `.dark`. **Never hardcode hex** in components — use the
Tailwind classes that map to these tokens (`bg-primary`, `text-muted-foreground`,
`border-border`, …).

| Token | Light | Role |
|---|---|---|
| `primary` / `primary-foreground` | `#7C3AED` / white | Main brand actions (violet) |
| `gold` / `gold-foreground` | `#F59E0B` / dark | Luxe accent CTA, "premium" |
| `secondary` / `secondary-foreground` | `#F2EEFC` / dark violet | Subtle buttons, chips |
| `accent` / `accent-foreground` | `#F1EBFE` / deep violet | Hover surfaces |
| `muted` / `muted-foreground` | `#F3F1FA` / `#6E6A7C` | Backgrounds, helper text |
| `destructive` | `#E11D48` | Errors, delete |
| `success` | `#16A34A` | Confirmations |
| `warning` | `#D97706` | Caution |
| `border` / `input` / `ring` | violet-slate / violet | Lines & focus |
| `background` / `foreground` / `card` | violet-white / `#14101D` / white | Surfaces |

Radius scale: `--radius` (0.625rem) → `rounded-sm|md|lg|xl`.

### Dark mode
Dark values are defined under `.dark`. It's wired and ready — add `class="dark"`
to `<html>` (or a theme toggle) to switch. No component changes needed; tokens
cascade automatically.

## Elements

| Element | File | Variants |
|---|---|---|
| Button | [button.tsx](../src/components/ui/button.tsx) | `default` (primary), `gold`, `secondary`, `destructive`, `outline`, `ghost`, `link` · sizes `sm/default/lg/icon` |
| Badge | [badge.tsx](../src/components/ui/badge.tsx) | `default`, `gold`, `secondary`, `success`, `destructive`, `outline` |
| Input | [input.tsx](../src/components/ui/input.tsx) | token-driven border/ring |
| PasswordInput | [password-input.tsx](../src/components/ui/password-input.tsx) | Input + show/hide toggle |
| Card | [card.tsx](../src/components/ui/card.tsx) | surface container |

## Adding a component
1. Build it from semantic tokens (no hardcoded colors/spacing).
2. Use `cva` for variants (see Button/Badge).
3. Add it to the `/design-system` showcase page so it stays documented.

## Figma
The same system is mirrored to Figma as variables + components (see the
[Event — Auth Screens](https://www.figma.com/design/ZsvuRb0FMMk9nFr9TyEf9P) file).
Keep code as the source of truth; regenerate/update Figma from it.
