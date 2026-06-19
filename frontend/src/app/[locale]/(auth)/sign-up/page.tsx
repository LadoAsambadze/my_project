import type { Metadata } from 'next'
import { AuthCard } from '@/components/auth/auth-card'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = {
  title: 'Sign up',
}

export default function SignUpPage() {
  return (
    <AuthCard>
      <SignUpForm />
    </AuthCard>
  )
}
