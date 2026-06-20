'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery } from '@apollo/client/react'
import { Link } from '@/i18n/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { ME_QUERY } from '@/graphql/auth/queries'
import { UPDATE_PROFILE_MUTATION } from '@/graphql/users/mutations'
import type { AuthUser, UpdateProfileInput } from '@/graphql/types'
import { ProfileForm } from '@/components/profile/profile-form'
import { ChangePasswordForm } from '@/components/profile/change-password-form'
import { Button } from '@/components/ui/button'

interface MeData {
  me: AuthUser
}

export default function SettingsPage() {
  const t = useTranslations('settings')
  const tp = useTranslations('profile')
  const tc = useTranslations('common')
  const { refetch } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data, loading } = useQuery<MeData>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const seed = (u: AuthUser) => {
    setFirstName(u.firstName ?? '')
    setLastName(u.lastName ?? '')
    setBirthDate(u.birthDate ? u.birthDate.slice(0, 10) : '')
    setBio(u.bio ?? '')
    setLocation(u.location ?? '')
    setAvatarUrl(u.avatarUrl ?? '')
  }

  useEffect(() => {
    if (data?.me && !initialized) {
      seed(data.me)
      setInitialized(true)
    }
  }, [data, initialized])

  const [updateProfile, { loading: saving }] = useMutation(
    UPDATE_PROFILE_MUTATION,
    {
      onCompleted: () => {
        setSaved(true)
        void refetch()
      },
    },
  )

  if (loading || !data?.me) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">{tc('loading')}</div>
      </div>
    )
  }

  const handleSave = () => {
    setSaved(false)
    const input: UpdateProfileInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate,
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl: avatarUrl.trim(),
    }
    void updateProfile({ variables: { input } })
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        <Link
          href="/profile"
          className="mt-1 text-sm font-medium text-primary hover:underline"
        >
          {t('backToProfile')}
        </Link>
      </div>

      {/* Profile details */}
      <section className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{t('profileSection')}</h2>
        <ProfileForm
          firstName={firstName}
          lastName={lastName}
          birthDate={birthDate}
          bio={bio}
          location={location}
          avatarUrl={avatarUrl}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          onBirthDateChange={setBirthDate}
          onBioChange={setBio}
          onLocationChange={setLocation}
          onAvatarUrlChange={setAvatarUrl}
        />
        {saved && <p className="text-sm text-success">{t('saved')}</p>}
        <div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? tp('saving') : tp('save')}
          </Button>
        </div>
      </section>

      {/* Change password */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{t('securitySection')}</h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
