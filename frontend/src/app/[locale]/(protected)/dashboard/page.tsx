'use client'

import { useTranslations } from 'next-intl'
import { CalendarHeart, Flower, Mail } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const { user } = useAuth()

  const greetingName = user?.name?.trim().split(/\s+/)[0] ?? null

  const quickActions = [
    { icon: CalendarHeart, title: t('newParty'), body: t('newPartyDesc') },
    { icon: Flower, title: t('orderFlowers'), body: t('orderFlowersDesc') },
    {
      icon: Mail,
      title: t('writeInvitations'),
      body: t('writeInvitationsDesc'),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('welcomeBack')}
          {greetingName ? `, ${greetingName}` : ''}!
        </h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickActions.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="flex flex-col gap-2 pt-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
