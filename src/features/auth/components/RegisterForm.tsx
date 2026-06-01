import {
  UserPlus,
  User,
  Mail,
  Lock,
  Shield,
  Phone,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import useAuthForm from "../hooks/useAuthForm";
import api from "../../../services/api";
import confetti from "canvas-confetti";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const navigate = useNavigate();

  const { values, errors, isLoading, submitError, handleChange, handleSubmit } =
    useAuthForm({
      initialValues: {
        nombre: "",
        apellido: "",
        ci: "",
        telefono: "",
        direccion: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      validate: (vals) => {
        const errs: Record<string, string> = {};
        if (!vals.nombre) {
          errs.nombre = "El nombre es requerido";
        }
        if (!vals.apellido) {
          errs.apellido = "El apellido es requerido";
        }
        if (!vals.ci) {
          errs.ci = "La Cédula de Identidad (CI) es requerida";
        }
        if (!vals.telefono) {
          errs.telefono = "El teléfono es requerido";
        }
        if (!vals.direccion) {
          errs.direccion = "La dirección es requerida";
        }
        if (!vals.email) {
          errs.email = "El correo electrónico es requerido";
        } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
          errs.email = "El correo electrónico no es válido";
        }
        if (!vals.password) {
          errs.password = "La contraseña es requerida";
        } else if (vals.password.length < 3) {
          errs.password = "La contraseña debe tener al menos 3 caracteres";
        }
        if (vals.password !== vals.confirmPassword) {
          errs.confirmPassword = "Las contraseñas no coinciden";
        }

        return errs;
      },
      onSubmit: async (vals) => {
        const requestData = {
          email: vals.email,
          password: vals.password,
          personaId: 0,

          nombre: vals.nombre,
          apellido: vals.apellido,
          ci: vals.ci,
          telefono: vals.telefono,
          direccion: vals.direccion,

          persona: {
            nombre: vals.nombre,
            apellido: vals.apellido,
            ci: vals.ci,
            telefono: vals.telefono,
            direccion: vals.direccion,
          },
        };

        await api.post("/Auth/register", requestData);

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#737373", "#a8a8a8", "#262626", "#d1d1d1"],
        });

        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            navigate("/login", { state: { registered: true } });
          }
        }, 1500);
      },
    });

  return (
    <div className="flex flex-col items-center w-full animate-fadeIn max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center justify-center w-14 h-14 border border-neutral-300 dark:border-neutral-700 rounded-lg p-3 mb-4 bg-white dark:bg-neutral-800 shadow-sm transition-colors duration-300">
        <UserPlus className="w-full h-full text-neutral-600 dark:text-neutral-300 stroke-[1.25]" />
      </div>

      <h1 className="text-[24px] font-display font-bold text-neutral-800 dark:text-neutral-100 tracking-tight mb-0.5 text-center select-none">
        Crear Cuenta
      </h1>
      <h2 className="text-[10px] font-sans font-semibold text-neutral-400 dark:text-neutral-500 tracking-[0.15em] mb-5 text-center select-none">
        SISTEMA DE PUNTO DE VENTA
      </h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-1">
        {submitError && (
          <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center animate-fadeIn">
            <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">
              {submitError}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5">
          <Input
            label="Nombre"
            name="nombre"
            type="text"
            placeholder="Juan"
            value={values.nombre}
            onChange={handleChange}
            error={errors.nombre}
            icon={<User className="w-4 h-4" />}
            autoComplete="given-name"
          />
          <Input
            label="Apellido"
            name="apellido"
            type="text"
            placeholder="Pérez"
            value={values.apellido}
            onChange={handleChange}
            error={errors.apellido}
            icon={<User className="w-4 h-4" />}
            autoComplete="family-name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3.5">
          <Input
            label="CI (Cédula de Identidad)"
            name="ci"
            type="text"
            placeholder="1234567 LP"
            value={values.ci}
            onChange={handleChange}
            error={errors.ci}
            icon={<Shield className="w-4 h-4" />}
          />
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            placeholder="78901234"
            value={values.telefono}
            onChange={handleChange}
            error={errors.telefono}
            icon={<Phone className="w-4 h-4" />}
            autoComplete="tel"
          />
        </div>

        <Input
          label="Dirección"
          name="direccion"
          type="text"
          placeholder="Av. Las Américas Nro 456"
          value={values.direccion}
          onChange={handleChange}
          error={errors.direccion}
          icon={<MapPin className="w-4 h-4" />}
          autoComplete="street-address"
        />

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
          placeholder="Mínimo 6 caracteres"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          placeholder="Repita su contraseña"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<Lock className="w-4 h-4" />}
          autoComplete="new-password"
        />
        <Button
          type="submit"
          isLoading={isLoading}
          className="py-2.5 bg-neutral-600 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-lg text-[14px] font-medium shadow-md transition-colors cursor-pointer select-none"
        >
          Registrarse
        </Button>
      </form>

      <div className="mt-4 text-[12px] text-neutral-400 dark:text-neutral-500 select-none">
        ¿Ya tienes una cuenta?{" "}
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
