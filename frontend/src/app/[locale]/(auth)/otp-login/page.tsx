import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { OtpLoginForm } from '@/components/auth/otp-login-form'

export const metadata: Metadata = {
  title: 'Sign in with a code',
}

export default function OtpLoginPage() {
  return (
    <AuthCard>
      <OtpLoginForm />
    </AuthCard>
  )
}
