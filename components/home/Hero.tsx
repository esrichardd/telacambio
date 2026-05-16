import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-20 px-4 text-center">
      <span className="inline-block mb-6 px-3 py-1 rounded-full bg-brand/15 text-brand text-sm font-medium">
        Mundial 2026 · Panini oficial
      </span>

      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
        Registra tu álbum.
        <br />
        Encuentra con quién cambiar.
      </h1>

      <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
        Lleva el control de tus barajitas, descubre quién tiene las que te
        faltan y coordina cambios por WhatsApp — todo gratis.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/register"
          className="px-6 py-3 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition-colors"
        >
          Empezar gratis
        </Link>
        <Link
          href="#como-funciona"
          className="px-6 py-3 rounded-full border border-border text-foreground font-semibold hover:bg-surface-subtle transition-colors"
        >
          ¿Cómo funciona?
        </Link>
      </div>
    </section>
  );
}
