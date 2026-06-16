# Design system

One **single source of truth** for design tokens, shared across the web and
mobile apps. You don't need Figma — edit the tokens, regenerate, and both apps
re-skin.

## Files

| File | Role |
| ---- | ---- |
| `tokens.json` | **The source of truth.** Colors, spacing, radius, typography, shadows. Edit this. |
| `generate.mjs` | Reads `tokens.json` and writes the platform files below. Plain Node, no deps. |

### Generated (do **not** edit by hand)

| Output | Consumed by |
| ------ | ----------- |
| `frontend/src/app/tokens.generated.css` | Web — CSS custom properties that shadcn/Tailwind already use (`--primary`, `--background`, `--radius`, …). Imported from `globals.css`. |
| `mobile/src/theme/tokens.generated.ts` | Mobile — a TS theme object (`lightColors`, `darkColors`, `spacing`, `radius`, typography, `shadow`). Re-exported from `mobile/src/theme`. |

## Workflow

1. Edit values in `design/tokens.json`.
2. Run the generator:
   ```bash
   node design/generate.mjs
   ```
3. Web picks up the CSS on the next dev refresh; mobile on the next Metro reload.

## Token model

- **`primitive.color`** — the raw palette (`brand`, `neutral`, status colors),
  each as a numeric scale.
- **`semantic.light` / `semantic.dark`** — role-based colors (`primary`,
  `background`, `muted`, `destructive`, …) that **reference** primitives with
  `{path}` syntax, e.g. `"primary": "{brand.500}"`. The generator resolves these.
- **`spacing`, `radius`, `typography`, `shadow`** — shared scales.

Changing a brand color in one place flows everywhere: edit `brand.500`, every
`{brand.500}` reference (web + mobile, light + dark) updates on regenerate.

## Seeing it live (instead of Figma)

The mobile app has a **Design System** showcase screen (Home → "View design
system", route `mobile/app/(app)/design-system.tsx`) that renders every token
and component. Run the app, open it, and you can see exactly what the tokens
produce — then ask for changes in plain language.
