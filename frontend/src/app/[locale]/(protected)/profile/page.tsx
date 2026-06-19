'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery } from '@apollo/client/react'
import { useAuth } from '@/lib/auth/auth-context'
import { ME_QUERY } from '@/graphql/auth/queries'
import { UPDATE_PROFILE_MUTATION } from '@/graphql/users/mutations'
import type { AuthUser, UpdateProfileInput } from '@/graphql/types'
import { Avatar } from '@/components/profile/avatar'
import { ProfileForm } from '@/components/profile/profile-form'
import { Button } from '@/components/ui/button'

interface MeData {
  me: AuthUser
}

export default function ProfilePage() {
  const t = useTranslations('profile')
  const tc = useTranslations('common')
  const { refetch } = useAuth()

  const [editMode, setEditMode] = useState(false)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [initialized, setInitialized] = useState(false)

  const { data, loading } = useQuery<MeData>(ME_QUERY, {
    fetchPolicy: 'network-only',
  })

  const seed = (u: AuthUser) => {
    setName(u.name ?? '')
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
        setEditMode(false)
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

  const profile = data.me
  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  })

  const handleSave = () => {
    const input: UpdateProfileInput = {
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl: avatarUrl.trim(),
    }
    void updateProfile({ variables: { input } })
  }

  const handleCancel = () => {
    seed(profile)
    setEditMode(false)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Cover + avatar */}
      <div className="relative mb-16 h-40 rounded-xl bg-linear-to-br from-primary/20 to-primary/5">
        <div className="absolute -bottom-12 left-6">
          <Avatar
            src={profile.avatarUrl}
            name={profile.name ?? profile.email}
            size="xl"
            className="ring-4 ring-background"
          />
        </div>
        {!editMode && (
          <div className="absolute bottom-3 right-4">
            <Button size="sm" variant="outline" onClick={() => setEditMode(true)}>
              {t('edit')}
            </Button>
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          {profile.name?.trim() || t('unnamed')}
        </h1>
        {profile.bio && (
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        )}
        {profile.location && (
          <p className="text-xs text-muted-foreground">📍 {profile.location}</p>
        )}
      </div>

      {/* Edit form */}
      {editMode ? (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <ProfileForm
            name={name}
            bio={bio}
            location={location}
            avatarUrl={avatarUrl}
            onNameChange={setName}
            onBioChange={setBio}
            onLocationChange={setLocation}
            onAvatarUrlChange={setAvatarUrl}
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              {t('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{t('email')}</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          {!profile.bio && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{t('bio')}</span>
              <span className="text-muted-foreground">{t('noBio')}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {t('memberSince')}
            </span>
            <span>{joined}</span>
          </div>
        </div>
      )}
    </div>
  )
}
