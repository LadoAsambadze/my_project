'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileFormProps {
  username: string
  firstName: string
  lastName: string
  birthDate: string
  bio: string
  location: string
  avatarUrl: string
  onUsernameChange: (v: string) => void
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onBirthDateChange: (v: string) => void
  onBioChange: (v: string) => void
  onLocationChange: (v: string) => void
  onAvatarUrlChange: (v: string) => void
}

export function ProfileForm({
  username,
  firstName,
  lastName,
  birthDate,
  bio,
  location,
  avatarUrl,
  onUsernameChange,
  onFirstNameChange,
  onLastNameChange,
  onBirthDateChange,
  onBioChange,
  onLocationChange,
  onAvatarUrlChange,
}: ProfileFormProps) {
  const t = useTranslations('profile')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-username">{t('username')}</Label>
        <div className="flex items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
          <span className="pl-3 text-sm text-muted-foreground">@</span>
          <Input
            id="profile-username"
            value={username}
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9._]+"
            className="border-0 bg-transparent pl-1 focus-visible:ring-0"
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('usernameHint')}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="profile-first-name">{t('firstName')}</Label>
          <Input
            id="profile-first-name"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="profile-last-name">{t('lastName')}</Label>
          <Input
            id="profile-last-name"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-birth-date">{t('birthDate')}</Label>
        <Input
          id="profile-birth-date"
          type="date"
          max={new Date().toISOString().split('T')[0]}
          value={birthDate}
          onChange={(e) => onBirthDateChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-bio">{t('bio')}</Label>
        <Input
          id="profile-bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-location">{t('location')}</Label>
        <Input
          id="profile-location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-avatar">{t('avatarUrl')}</Label>
        <Input
          id="profile-avatar"
          type="url"
          inputMode="url"
          placeholder="https://…"
          value={avatarUrl}
          onChange={(e) => onAvatarUrlChange(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t('avatarUrlHint')}</p>
      </div>
    </div>
  )
}
