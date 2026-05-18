import Link from "next/link";

export default function BottomCta() {
  return (
    <section className="py-20 px-4 text-center">
      <h2 className="text-2xl font-bold text-foreground">
        ¿Listo para completar tu álbum?
      </h2>
      <p className="text-muted mt-2 mb-8">
        Gratis. Sin descargar nada. Funciona en tu celular.
      </p>

      <Link
        href="/register"
        className="inline-block px-8 py-3 rounded-full bg-brand text-white font-semibold hover:bg-brand-dark transition-colors"
      >
        Empezar ahora →
      </Link>

      <p className="mt-6 text-xs text-muted">
        Gratis. Solo necesitas un email. En menos de un minuto ya puedes empezar.
      </p>
    </section>
  );
}
