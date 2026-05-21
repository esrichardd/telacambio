import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="shrink-0 h-14 bg-background/95 backdrop-blur border-b border-border flex items-center">
      <div className="max-w-2xl mx-auto w-full px-4 flex items-center justify-between">
        {/* Marca */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-lg font-black tracking-tight">
            <span className="text-brand">Tela</span>
            <span className="text-foreground">Cambio</span>
          </span>
        </Link>

        {/* Punto decorativo — sutilmente indica que es una app activa */}
        <span className="w-2 h-2 rounded-full bg-brand/60" />
      </div>
    </header>
  );
}
