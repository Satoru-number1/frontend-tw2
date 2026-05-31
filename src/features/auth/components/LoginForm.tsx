import { Home, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import useAuthForm from '../hooks/useAuthForm';
import api from '../../../services/api';

interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();


  const {
    values,
    errors,
    isLoading,
    submitError,
    handleChange,
    handleSubmit,
  } = useAuthForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      if (!vals.email) {
        errs.email = 'El correo electrónico es requerido';
      } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
        errs.email = 'El correo electrónico no es válido';
      }
      if (!vals.password) {
        errs.password = 'La contraseña es requerida';
      } else if (vals.password.length < 3) {
        errs.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      return errs;
    },
    onSubmit: async (vals) => {

      const response = await api.post('/auth/login', {
        email: vals.email,
        password: vals.password,
      });

      const { token, rol } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem(
        'user',
        JSON.stringify({ name: 'Administrador', email: vals.email, role: rol })
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    },
  });

  return (
    <div className="flex flex-col items-center w-full animate-fadeIn">

      <div className="flex items-center justify-center w-16 h-16 border border-neutral-300 dark:border-neutral-700 rounded-lg p-3.5 mb-5 bg-white dark:bg-neutral-800 shadow-sm transition-colors duration-300">
        <Home className="w-full h-full text-neutral-600 dark:text-neutral-300 stroke-[1.25]" />
      </div>


      <h1 className="text-[28px] font-display font-bold text-neutral-800 dark:text-neutral-100 tracking-tight mb-1 text-center select-none">
        El Ahorro
      </h1>
      <h2 className="text-[11px] font-sans font-semibold text-neutral-400 dark:text-neutral-500 tracking-[0.15em] mb-8 text-center select-none">
        SISTEMA DE PUNTO DE VENTA
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col">
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center">
            <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">
              {submitError}
            </p>
          </div>
        )}

        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          placeholder="usuario@elahorro.bo"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail className="w-4 h-4" />}
          autoComplete="email"
        />


        <Input
          label="Contraseña"
          name="password"
          type="password"
          placeholder="........"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          isLoading={isLoading}
          className="mt-2 py-3 bg-neutral-600 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-lg text-[15px] font-medium shadow-md transition-colors cursor-pointer select-none"
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Link
          to="/forgot-password"
          className="text-[13px] font-medium text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors select-none"
        >
          ¿Olvidó su contraseña?
        </Link>

        <div className="text-[13px] text-neutral-400 dark:text-neutral-500 select-none">
          ¿No tienes una cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-white transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
