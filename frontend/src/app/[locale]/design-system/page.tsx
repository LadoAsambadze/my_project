import type { Metadata } from 'next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Design System',
}

const colorTokens = [
  { name: 'Primary', cls: 'bg-primary', fg: 'text-primary-foreground', hex: '#7C3AED' },
  { name: 'Gold', cls: 'bg-gold', fg: 'text-gold-foreground', hex: '#F59E0B' },
  { name: 'Secondary', cls: 'bg-secondary', fg: 'text-secondary-foreground', hex: '#F2EEFC' },
  { name: 'Accent', cls: 'bg-accent', fg: 'text-accent-foreground', hex: '#F1EBFE' },
  { name: 'Muted', cls: 'bg-muted', fg: 'text-muted-foreground', hex: '#F3F1FA' },
  { name: 'Destructive', cls: 'bg-destructive', fg: 'text-destructive-foreground', hex: '#E11D48' },
  { name: 'Success', cls: 'bg-success', fg: 'text-success-foreground', hex: '#16A34A' },
  { name: 'Warning', cls: 'bg-warning', fg: 'text-warning-foreground', hex: '#D97706' },
]

const radii = [
  { name: 'sm', cls: 'rounded-sm' },
  { name: 'md', cls: 'rounded-md' },
  { name: 'lg', cls: 'rounded-lg' },
  { name: 'xl', cls: 'rounded-xl' },
  { name: 'full', cls: 'rounded-full' },
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
            E
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Design System</h1>
            <p className="text-sm text-muted-foreground">
              Premium Purple — tokens & elements for the events marketplace.
            </p>
          </div>
        </div>
      </header>

      {/* Colors */}
      <Section title="Colors" description="Semantic tokens. Light & dark are driven by CSS variables.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {colorTokens.map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div
                className={`flex h-20 items-end rounded-lg border border-border p-2 ${c.cls} ${c.fg}`}
              >
                <span className="text-xs font-medium">Aa</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.hex}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons" description="Variants (primary, gold, secondary, destructive, outline, ghost, link).">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="gold">Gold CTA</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges" description="For categories: flowers, lights, songs, singers, invitations…">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Featured</Badge>
          <Badge variant="gold">Premium</Badge>
          <Badge variant="secondary">Flowers</Badge>
          <Badge variant="success">Available</Badge>
          <Badge variant="destructive">Sold out</Badge>
          <Badge variant="outline">Invitations</Badge>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Form fields" description="Inputs inherit the border, ring, and radius tokens.">
        <div className="grid max-w-sm gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-email">Email</Label>
            <Input id="ds-email" type="email" placeholder="you@example.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-disabled">Disabled</Label>
            <Input id="ds-disabled" placeholder="Disabled" disabled />
          </div>
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" description="Geist Sans across the scale.">
        <div className="flex flex-col gap-2">
          <p className="text-3xl font-bold tracking-tight">Heading 1 — Plan unforgettable events</p>
          <p className="text-2xl font-semibold tracking-tight">Heading 2 — Flowers, lights & music</p>
          <p className="text-lg font-medium">Heading 3 — Book trusted vendors</p>
          <p className="text-base">Body — Browse designs, flowers, lights, songs, singers and invitation letters, all in one place.</p>
          <p className="text-sm text-muted-foreground">Muted — Supporting copy and helper text.</p>
        </div>
      </Section>

      {/* Radius + surface */}
      <Section title="Radius & surfaces" description="Corner radii and the card surface token.">
        <div className="flex flex-wrap items-center gap-4">
          {radii.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-1">
              <div className={`h-14 w-14 border border-border bg-secondary ${r.cls}`} />
              <span className="text-xs text-muted-foreground">{r.name}</span>
            </div>
          ))}
        </div>
        <Card className="max-w-sm">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">Card surface</p>
            <p className="text-sm text-muted-foreground">
              bg-card on bg-background, separated by the border token.
            </p>
          </CardContent>
        </Card>
      </Section>
    </div>
  )
}
