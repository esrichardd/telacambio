"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";

type VerifyType = "signup" | "reset";

const content: Record<
  VerifyType,
  { title: string; subtitle: string; description: string; resendLabel: string }
> = {
  signup: {
    title: "Verifica tu correo 📩",
    subtitle: "Casi listo. Solo falta confirmar tu cuenta.",
    description:
      "Te enviamos un link de confirmación. Haz clic en él para activar tu cuenta y empezar a registrar tu álbum.",
    resendLabel: "Reenviar correo de confirmación",
  },
  reset: {
    title: "Revisa tu correo 📩",
    subtitle: "Te enviamos un link para restablecer tu contraseña.",
    description:
      "Haz clic en el link que te enviamos para crear una nueva contraseña. El link expira en 1 hora.",
    resendLabel: "Reenviar link de recuperación",
  },
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as VerifyType) ?? "signup";
  const email = searchParams.get("email") ?? "";

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const copy = content[type] ?? content.signup;

  async function handleResend() {
    if (!email) return;
    setResending(true);
    setResendStatus("idle");

    const supabase = createClient();

    let error = null;

    if (type === "signup") {
      const result = await supabase.auth.resend({
        type: "signup",
        email,
      });
      error = result.error;
    } else {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      error = result.error;
    }

    setResending(false);
    setResendStatus(error ? "error" : "success");
  }

  return (
    <AuthCard title={copy.title} subtitle={copy.subtitle}>
      <div className="flex flex-col gap-5">
        {/* Correo al que se envió */}
        {email && (
          <div className="rounded-xl bg-surface-subtle border border-border px-4 py-3 text-sm text-muted">
            Enviado a:{" "}
            <span className="font-semibold text-foreground">{email}</span>
          </div>
        )}

        {/* Descripción */}
        <p className="text-sm text-muted leading-relaxed">{copy.description}</p>

        {/* Tip de spam */}
        <div className="rounded-xl bg-brand/6 border border-brand/15 px-4 py-3 text-xs text-muted leading-relaxed">
          ¿No ves el correo?{" "}
          <span className="text-foreground">
            Revisa tu carpeta de spam o correo no deseado.
          </span>
        </div>

        {/* Feedback de reenvío */}
        {resendStatus === "success" && (
          <AuthAlert
            type="success"
            message="Correo reenviado. Revisa tu bandeja de entrada."
          />
        )}
        {resendStatus === "error" && (
          <AuthAlert
            type="error"
            message="No pudimos reenviar el correo. Espera un momento e inténtalo de nuevo."
          />
        )}

        {/* Reenviar */}
        <AuthButton
          type="button"
          variant="ghost"
          loading={resending}
          onClick={handleResend}
          disabled={!email}
        >
          {copy.resendLabel}
        </AuthButton>

        {/* Volver */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Volver al login
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}
