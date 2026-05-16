import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-brand">
          TeLaCambio
        </Link>

        <Link
          href="/login"
          className="text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          Entrar →
        </Link>
      </div>
    </header>
  );
}
