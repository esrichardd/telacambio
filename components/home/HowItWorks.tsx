const steps = [
  {
    n: "1",
    title: "Crea tu perfil",
    desc: "Sin contraseña. Solo elige un username y listo.",
  },
  {
    n: "2",
    title: "Registra tus barajitas",
    desc: "Marca las que tienes y las que te faltan. O escanea de a una.",
  },
  {
    n: "3",
    title: "Busca y cambia",
    desc: "Encuentra usuarios cerca tuyo y coordina el cambio por WhatsApp.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 px-4 bg-surface-subtle">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-foreground mb-12">
          Tan fácil como 1, 2, 3
        </h2>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center">
                {s.n}
              </span>
              <div>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
