import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../features/auth/components/RegisterForm';

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  );
}
