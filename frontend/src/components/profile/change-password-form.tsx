'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@apollo/client/react'
import { CHANGE_PASSWORD_MUTATION } from '@/graphql/users/mutations'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'

export function ChangePasswordForm() {
  const t = useTranslations('profile')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION, {
    onCompleted: () => {
      setDone(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err) => setError(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setDone(false)
    if (newPassword.length < 8) {
      setError(t('passwordTooShort'))
      return
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordsNoMatch'))
      return
    }
    void changePassword({
      variables: {
        input: { currentPassword: currentPassword || undefined, newPassword },
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="current-password">{t('currentPassword')}</Label>
        <PasswordInput
          id="current-password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          {t('currentPasswordHint')}
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password">{t('newPassword')}</Label>
        <PasswordInput
          id="new-password"
          autoComplete="new-password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-new-password">{t('confirmNewPassword')}</Label>
        <PasswordInput
          id="confirm-new-password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      {done && <p className="text-sm text-success">{t('passwordUpdated')}</p>}
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={loading}>
          {loading ? t('updating') : t('updatePassword')}
        </Button>
      </div>
    </form>
  )
}
