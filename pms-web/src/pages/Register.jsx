import { AuthLayout, AuthPanel, RegisterForm } from '../features/auth/index.js'

export default function Register() {
  return (
    <AuthLayout>
      <AuthPanel>
        <RegisterForm />
      </AuthPanel>
    </AuthLayout>
  )
}
