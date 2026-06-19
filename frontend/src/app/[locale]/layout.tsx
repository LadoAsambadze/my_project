import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { ApolloClientProvider } from '@/lib/apollo/provider'
import { AuthProvider } from '@/lib/auth/auth-context'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: {
      default: 'Event — Parties, Flowers & Invitations',
      template: '%s | Event',
    },
    description: 'Plan events, parties and invitations — all in one place.',
    openGraph: {
      type: 'website',
      locale: locale === 'ka' ? 'ka_GE' : 'en_US',
      siteName: 'Event',
    },
  }
}

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ApolloClientProvider>
        <AuthProvider>{children}</AuthProvider>
      </ApolloClientProvider>
    </NextIntlClientProvider>
  )
}
