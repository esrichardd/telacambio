"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";

function translateUrlError(code: string | null): string | null {
  if (code === "link-expirado")
    return "El link ha expirado o ya fue usado. Solicita uno nuevo.";
  return null;
}

const initialState: LoginState = {};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = translateUrlError(searchParams.get("error"));

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <AuthCard
      title="Bienvenido de nuevo"
      subtitle="Entra para ver y gestionar tu álbum."
    >
      <form action={formAction} noValidate className="flex flex-col gap-4">
        {urlError && !state.error && (
          <AuthAlert type="error" message={urlError} />
        )}
        {state.error && <AuthAlert type="error" message={state.error} />}

        <AuthInput
          id="email"
          name="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          error={state.fieldErrors?.email}
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-brand transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <AuthInput
            id="password"
            name="password"
            label=""
            type="password"
            showToggle
            placeholder="Tu contraseña"
            autoComplete="current-password"
            error={state.fieldErrors?.password}
          />
        </div>

        <div className="pt-1">
          <AuthButton type="submit" loading={isPending}>
            Entrar
          </AuthButton>
        </div>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">¿No tienes cuenta?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link
        href="/register"
        className="block w-full py-3 px-4 rounded-full border border-border text-sm font-semibold text-foreground text-center hover:bg-surface-subtle transition-colors"
      >
        Crear cuenta gratis
      </Link>
    </AuthCard>
  );
}
