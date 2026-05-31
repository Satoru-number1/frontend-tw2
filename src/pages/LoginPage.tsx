import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../features/auth/components/LoginForm';
import { CheckCircle2, X } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }


    if (location.state?.registered) {
      setShowToast(true);

      window.history.replaceState({}, document.title);

      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate, location]);

  return (
    <AuthLayout>
      {showToast && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2.5 px-4 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 rounded-xl shadow-lg border border-neutral-800 dark:border-neutral-200 animate-slideIn z-50 select-none">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-[13px] font-semibold text-white dark:text-neutral-950">
            se registro correctamente. Por favor inicie sesión.
          </span>
          <button
            onClick={() => setShowToast(false)}
            className="p-0.5 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
          </button>
        </div>
      )}

      <LoginForm />
    </AuthLayout>
  );
}
