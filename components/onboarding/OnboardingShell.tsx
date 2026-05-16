"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { completeOnboarding, checkUsernameAvailable } from "@/lib/db/profiles";
import type { TradingStatus, OnboardingData } from "@/types/app";

import AuthCard from "@/components/auth/AuthCard";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import StepUsername from "@/components/onboarding/StepUsername";
import StepLocation from "@/components/onboarding/StepLocation";
import StepTrading from "@/components/onboarding/StepTrading";

const TOTAL_STEPS = 3;

const STEP_META = [
  {
    title: "Crea tu perfil",
    subtitle: "¿Cómo quieres que te conozcan en TeLaCambio?",
  },
  {
    title: "¿Dónde estás?",
    subtitle: "Te conectamos con coleccionistas cercanos a ti.",
  },
  {
    title: "¿Cómo intercambias?",
    subtitle: "Cuéntanos cómo prefieres hacer cambios.",
  },
];

interface LocalState {
  // Step 1
  username: string;
  display_name: string;
  // Step 2 (departamento is UI-only, not saved to DB)
  departamento: string;
  city: string;
  // Step 3
  trading_status: TradingStatus;
  whatsapp_number: string;
  show_whatsapp: boolean;
}

interface OnboardingShellProps {
  userId: string;
}

export default function OnboardingShell({ userId }: OnboardingShellProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [form, setForm] = useState<LocalState>({
    username: "",
    display_name: "",
    departamento: "",
    city: "",
    trading_status: "active",
    whatsapp_number: "",
    show_whatsapp: false,
  });

  function handleChange(field: keyof LocalState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldError(null);
    setError(null);
  }

  // Generic handler that maps onboarding step field names to LocalState keys
  function handleStep1Change(
    field: "username" | "display_name",
    value: string,
  ) {
    handleChange(field, value);
  }

  function handleStep2Change(field: "departamento" | "city", value: string) {
    if (field === "departamento") {
      setForm((prev) => ({ ...prev, departamento: value, city: "" }));
    } else {
      handleChange(field, value);
    }
    setFieldError(null);
    setError(null);
  }

  function handleStep3Change(
    field: "trading_status" | "whatsapp_number" | "show_whatsapp",
    value: string | boolean,
  ) {
    handleChange(field as keyof LocalState, value);
  }

  async function validateStep(): Promise<boolean> {
    if (step === 1) {
      if (!form.username || form.username.length < 3) {
        setFieldError(
          "El username es obligatorio y debe tener al menos 3 caracteres.",
        );
        return false;
      }
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!usernameRegex.test(form.username)) {
        setFieldError(
          "El username solo puede contener letras, números, _ y -.",
        );
        return false;
      }
      // Check availability one more time before advancing
      const supabase = createClient();
      const available = await checkUsernameAvailable(
        supabase,
        form.username,
        userId,
      );
      if (!available) {
        setFieldError(`@${form.username} ya está en uso. Elige otro.`);
        return false;
      }
    }
    // Steps 2 and 3 are optional — no blocking validation
    return true;
  }

  async function handleNext() {
    setFieldError(null);
    setError(null);

    const valid = await validateStep();
    if (!valid) return;

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      await handleSubmit();
    }
  }

  function handleBack() {
    setFieldError(null);
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      const onboardingData: OnboardingData = {
        username: form.username.toLowerCase().trim(),
        display_name: form.display_name.trim(),
        country_code: "CO",
        city: form.city || undefined,
        trading_status: form.trading_status,
        whatsapp_number: form.whatsapp_number.trim() || undefined,
        show_whatsapp: form.show_whatsapp,
      };

      await completeOnboarding(supabase, userId, onboardingData);

      // Redirect to dashboard on success
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("Ocurrió un error al guardar tu perfil. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  const meta = STEP_META[step - 1];
  const isLastStep = step === TOTAL_STEPS;

  return (
    <AuthCard title={meta.title} subtitle={meta.subtitle}>
      <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      <div className="min-h-[260px]">
        {step === 1 && (
          <StepUsername
            username={form.username}
            displayName={form.display_name}
            userId={userId}
            onChange={handleStep1Change}
            error={fieldError ?? undefined}
          />
        )}
        {step === 2 && (
          <StepLocation
            departamento={form.departamento}
            city={form.city}
            onChange={handleStep2Change}
          />
        )}
        {step === 3 && (
          <StepTrading
            tradingStatus={form.trading_status}
            whatsappNumber={form.whatsapp_number}
            showWhatsapp={form.show_whatsapp}
            onChange={handleStep3Change}
          />
        )}
      </div>

      {error && (
        <div className="mt-4">
          <AuthAlert type="error" message={error} />
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {step > 1 && (
          <AuthButton
            variant="ghost"
            onClick={handleBack}
            disabled={submitting}
            className="flex-1"
          >
            ← Atrás
          </AuthButton>
        )}

        <AuthButton
          onClick={handleNext}
          loading={submitting}
          className={step > 1 ? "flex-[2]" : "w-full"}
        >
          {isLastStep ? "Empezar a coleccionar 🎴" : "Continuar →"}
        </AuthButton>
      </div>

      {step === 2 && (
        <button
          type="button"
          onClick={() => setStep(3)}
          className="mt-3 w-full text-center text-xs text-muted hover:text-foreground transition-colors"
        >
          Omitir este paso
        </button>
      )}
    </AuthCard>
  );
}
