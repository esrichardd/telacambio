export default function QRPlaceholderCard() {
  return (
    <div className="mx-4 rounded-2xl bg-surface border border-border p-5">
      {/* QR placeholder */}
      <div className="flex justify-center mb-5">
        <div className="w-40 h-40 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-surface-subtle">
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted opacity-40"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="5" y="5" width="3" height="3" fill="currentColor" />
            <rect x="16" y="5" width="3" height="3" fill="currentColor" />
            <rect x="5" y="16" width="3" height="3" fill="currentColor" />
            <path
              d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </div>
      </div>

      {/* Badge próximamente */}
      <div className="flex justify-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm1 14.5h-2v-6h2v6zm0-8h-2V6h2v2.5z" />
          </svg>
          Próximamente
        </span>
      </div>

      <p className="text-center text-sm text-muted leading-relaxed">
        Podrás mostrar tu QR para que otros coleccionistas encuentren tu perfil
        al instante
      </p>
    </div>
  );
}
