"use client";

import { useState } from "react";
import Link from "next/link";
import type { Profile, TradingStatus } from "@/types/app";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/db/profiles";
import { COLOMBIA_DEPARTAMENTOS } from "@/lib/constants/colombia";
import StepUsername from "@/components/onboarding/StepUsername";
import StepLocation from "@/components/onboarding/StepLocation";
import StepTrading from "@/components/onboarding/StepTrading";
import AuthAlert from "@/components/auth/AuthAlert";

// Deriva el departamento a partir de la ciudad guardada en DB
function getDepartamentoFromCity(city: string | null): string {
  if (!city) return "";
  for (const dep of COLOMBIA_DEPARTAMENTOS) {
    if (dep.ciudades.includes(city)) return dep.name;
  }
  return "";
}

interface ProfileSettingsFormProps {
  profile: Profile;
  userId: string;
}

export default function ProfileSettingsForm({
  profile,
  userId,
}: ProfileSettingsFormProps) {
  // ── Estado del formulario ────────────────────────────────────────────────
  const [username, setUsername] = useState(profile.username ?? "");
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [departamento, setDepartamento] = useState(
    getDepartamentoFromCity(profile.city),
  );
  const [city, setCity] = useState(profile.city ?? "");
  const [tradingStatus, setTradingStatus] = useState<TradingStatus>(
    profile.trading_status ?? "active",
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    profile.whatsapp_number ?? "",
  );
  const [showWhatsapp, setShowWhatsapp] = useState(
    profile.show_whatsapp ?? false,
  );

  // ── Estado de guardado ───────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // ── Handlers para cada sección ───────────────────────────────────────────
  function handleUsernameChange(
    field: "username" | "display_name",
    value: string,
  ) {
    setUsernameError(null);
    setSaved(false);
    if (field === "username") setUsername(value);
    else setDisplayName(value);
  }

  function handleLocationChange(
    field: "departamento" | "city",
    value: string,
  ) {
    setSaved(false);
    if (field === "departamento") {
      setDepartamento(value);
      setCity(""); // resetear ciudad al cambiar departamento
    } else {
      setCity(value);
    }
  }

  function handleTradingChange(
    field: "trading_status" | "whatsapp_number" | "show_whatsapp",
    value: string | boolean,
  ) {
    setSaved(false);
    if (field === "trading_status") setTradingStatus(value as TradingStatus);
    else if (field === "whatsapp_number") setWhatsappNumber(value as string);
    else if (field === "show_whatsapp") setShowWhatsapp(value as boolean);
  }

  // ── Guardar ──────────────────────────────────────────────────────────────
  async function handleSave() {
    setError(null);
    setUsernameError(null);
    setSaved(false);

    if (!username || username.length < 3) {
      setUsernameError("El username debe tener al menos 3 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      await updateProfile(supabase, userId, {
        username,
        display_name: displayName || undefined,
        city: city || undefined,
        country_code: city ? "CO" : undefined,
        trading_status: tradingStatus,
        whatsapp_number: whatsappNumber || undefined,
        show_whatsapp: showWhatsapp,
      });
      setSaved(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      // El error de username duplicado viene de Supabase con código 23505
      if (msg.includes("profiles_username_key") || msg.includes("23505")) {
        setUsernameError("Este username ya está en uso.");
      } else {
        setError("No se pudo guardar. Intenta de nuevo.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold text-foreground mt-2">
            Configuración
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Actualiza tu información de perfil.
          </p>
        </div>
      </div>

      {/* Sección: Tu perfil */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Tu perfil
        </h2>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <StepUsername
            username={username}
            displayName={displayName}
            userId={userId}
            onChange={handleUsernameChange}
            error={usernameError ?? undefined}
          />
        </div>
      </section>

      {/* Sección: Ubicación */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Ubicación
        </h2>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <StepLocation
            departamento={departamento}
            city={city}
            onChange={handleLocationChange}
          />
        </div>
      </section>

      {/* Sección: Intercambios */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Intercambios
        </h2>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <StepTrading
            tradingStatus={tradingStatus}
            whatsappNumber={whatsappNumber}
            showWhatsapp={showWhatsapp}
            onChange={handleTradingChange}
          />
        </div>
      </section>

      {/* Feedback */}
      {error && <AuthAlert type="error" message={error} />}
      {saved && (
        <AuthAlert type="success" message="Cambios guardados correctamente." />
      )}

      {/* Botón guardar */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>

      {/* Enlace al perfil público */}
      <p className="text-center text-xs text-muted">
        Tu perfil público:{" "}
        <Link
          href={`/${profile.username}`}
          className="text-brand hover:underline"
          target="_blank"
        >
          telacambio.com/@{profile.username}
        </Link>
      </p>
    </div>
  );
}
