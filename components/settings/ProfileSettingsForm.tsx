"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Profile, TradingStatus } from "@/types/app";
import { logoutAction } from "@/app/actions/auth";
import UsernameField from "./UsernameField";
import DisplayNameField from "./DisplayNameField";
import ChangePasswordButton from "./ChangePasswordButton";
import LocationSection from "./LocationSection";
import TradingStatusSection from "./TradingStatusSection";
import WhatsappSection from "./WhatsappSection";

interface ProfileSettingsFormProps {
  profile: Profile;
  userId: string;
  userEmail: string;
}

export default function ProfileSettingsForm({
  profile,
  userId,
  userEmail,
}: ProfileSettingsFormProps) {
  // tradingStatus is lifted here so WhatsappSection can react when it changes
  const [tradingStatus, setTradingStatus] = useState<TradingStatus>(
    profile.trading_status ?? "active",
  );
  const [isLoggingOut, startLogoutTransition] = useTransition();

  function handleLogout() {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted mt-0.5">
          Actualiza tu información de perfil.
        </p>
      </div>

      {/* Sección: Tu perfil */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Tu perfil
        </h2>
        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5">
          <UsernameField username={profile.username ?? ""} userId={userId} />
          <hr className="border-border" />
          <DisplayNameField displayName={profile.display_name ?? ""} />
          <hr className="border-border" />
          <ChangePasswordButton email={userEmail} />
        </div>
      </section>

      {/* Sección: Ubicación */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Ubicación
        </h2>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <LocationSection
            initialCountry={profile.country_code ?? ""}
            initialState={(profile as Record<string, unknown>).state_code as string ?? ""}
            initialCity={profile.city ?? ""}
          />
        </div>
      </section>

      {/* Sección: Intercambios */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold text-muted uppercase tracking-wider">
          Intercambios
        </h2>
        <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5">
          <TradingStatusSection
            initialStatus={tradingStatus}
            onStatusChange={setTradingStatus}
          />
          <hr className="border-border" />
          <WhatsappSection
            initialNumber={profile.whatsapp_number ?? ""}
            initialShow={profile.show_whatsapp ?? false}
            tradingStatus={tradingStatus}
          />
        </div>
      </section>

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

      {/* Cerrar sesión */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full py-3 rounded-full border border-border text-muted text-sm font-medium hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
        </button>
      </div>
    </div>
  );
}
