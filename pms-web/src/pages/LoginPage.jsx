import { AuthLayout, AuthPanel, LoginForm } from '../features/auth/index.js'

export default function LoginPage() {
  return (
    <AuthLayout>
      <AuthPanel>
        <LoginForm />
      </AuthPanel>
    </AuthLayout>
  )
}
