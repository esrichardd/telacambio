"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";

function translateError(message: string): string {
  if (message.includes("Password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (
    message.includes("Auth session missing") ||
    message.includes("not authenticated")
  )
    return "El link ha expirado. Solicita uno nuevo desde la pantalla de login.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Demasiados intentos. Espera unos minutos.";
  return "No pudimos actualizar tu contraseña. Inténtalo de nuevo.";
}

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu nueva contraseña.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return errors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setGlobalError(translateError(error.message));
      return;
    }

    setSuccess(true);

    // Redirigir al login tras 2.5s
    setTimeout(() => router.push("/login"), 2500);
  }

  if (success) {
    return (
      <AuthCard
        title="¡Contraseña actualizada! ✓"
        subtitle="Ya puedes entrar con tu nueva contraseña."
      >
        <div className="flex flex-col gap-4">
          <AuthAlert
            type="success"
            message="Tu contraseña fue actualizada correctamente. Redirigiendo al login…"
          />
          <AuthButton type="button" onClick={() => router.push("/login")}>
            Ir al login ahora
          </AuthButton>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Nueva contraseña"
      subtitle="Elige una contraseña segura para tu cuenta."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {globalError && <AuthAlert type="error" message={globalError} />}

        <AuthInput
          id="password"
          label="Nueva contraseña"
          type="password"
          showToggle
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password}
        />

        <AuthInput
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          showToggle
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          error={fieldErrors.confirmPassword}
        />

        <div className="pt-1">
          <AuthButton type="submit" loading={loading}>
            Guardar nueva contraseña
          </AuthButton>
        </div>
      </form>
    </AuthCard>
  );
}
