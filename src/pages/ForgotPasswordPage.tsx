import AuthLayout from '../layouts/AuthLayout';
import RecoveryForm from '../features/auth/components/RecoveryForm';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <RecoveryForm />
    </AuthLayout>
  );
}
