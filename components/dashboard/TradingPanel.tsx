import type { Profile } from "@/types/app";

interface TradingPanelProps {
  profile: Profile;
}

export default function TradingPanel({ profile }: TradingPanelProps) {
  const hasWhatsapp = profile.show_whatsapp && profile.whatsapp_number;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-xs text-muted uppercase tracking-wide font-medium">
        Intercambios
      </p>

      {/* WhatsApp */}
      {hasWhatsapp ? (
        <a
          href={`https://wa.me/${profile.whatsapp_number?.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand/8 border border-brand/20 hover:bg-brand/12 transition-colors"
        >
          <span className="text-xl">💬</span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {profile.whatsapp_number}
            </p>
            <p className="text-xs text-muted">Disponible para cambios por WhatsApp</p>
          </div>
        </a>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-subtle border border-border">
          <span className="text-xl">💬</span>
          <p className="text-sm text-muted">
            Sin WhatsApp configurado.{" "}
            <span className="text-brand cursor-not-allowed" title="Próximamente">
              Agregar →
            </span>
          </p>
        </div>
      )}

      {/* Próximamente */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-border">
        <span className="text-xl">📍</span>
        <div>
          <p className="text-sm font-medium text-foreground">
            Coleccionistas cercanos
          </p>
          <p className="text-xs text-muted">Próximamente — encuentra quién tiene lo que necesitas</p>
        </div>
      </div>
    </div>
  );
}
