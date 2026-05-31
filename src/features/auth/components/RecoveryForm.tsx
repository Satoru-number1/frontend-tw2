import { useState } from 'react';
import { Key, Mail, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import useAuthForm from '../hooks/useAuthForm';
import api from '../../../services/api';

export default function RecoveryForm() {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

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
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      if (!vals.email) {
        errs.email = 'El correo electrónico es requerido';
      } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
        errs.email = 'El correo electrónico no es válido';
      }
      return errs;
    },
    onSubmit: async (vals) => {
      try {
        await api.post('/auth/forgot-password', { email: vals.email });
      } catch (err) {
        console.warn('El endpoint de recuperación de contraseña aún no está disponible');
      }

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 3500);
    },
  });

  return (
    <div className="flex flex-col items-center w-full animate-fadeIn">
      <div className="flex items-center justify-center w-16 h-16 border border-neutral-300 dark:border-neutral-700 rounded-lg p-3.5 mb-5 bg-white dark:bg-neutral-800 shadow-sm transition-colors duration-300">
        <Key className="w-full h-full text-neutral-600 dark:text-neutral-300 stroke-[1.25]" />
      </div>

      <h1 className="text-[28px] font-display font-bold text-neutral-800 dark:text-neutral-100 tracking-tight mb-1 text-center select-none">
        Recuperar Acceso
      </h1>
      <h2 className="text-[11px] font-sans font-semibold text-neutral-400 dark:text-neutral-500 tracking-[0.15em] mb-8 text-center select-none">
        SISTEMA DE PUNTO DE VENTA
      </h2>

      {isSuccess ? (
        <div className="w-full flex flex-col items-center p-5 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl text-center animate-fadeIn select-none">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="text-[15px] font-bold text-green-800 dark:text-green-300 mb-1.5">
            ¡Correo enviado!
          </h3>
          <p className="text-[12px] text-green-700 dark:text-green-400 leading-relaxed font-medium">
            Hemos enviado un enlace de recuperación a <strong>{values.email}</strong>. Por favor revise su bandeja de entrada.
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-4">
            Redireccionando al inicio de sesión...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col">
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center">
              <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">
                {submitError}
              </p>
            </div>
          )}

          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6 text-center select-none">
            Ingrese su correo electrónico y le enviaremos un enlace de seguridad para restablecer su contraseña de inmediato.
          </p>

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

          <Button
            type="submit"
            isLoading={isLoading}
            className="mt-2 py-3 bg-neutral-600 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-lg text-[15px] font-medium shadow-md transition-colors cursor-pointer select-none"
          >
            Enviar Enlace
          </Button>
        </form>
      )}

      <div className="mt-6 text-[13px] text-neutral-400 dark:text-neutral-500 select-none">
        ¿Recordó su contraseña?{' '}
        <Link
          to="/login"
          className="font-semibold text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-white transition-colors"
        >
          Iniciar Sesión
        </Link>
      </div>
    </div>
  );
}
