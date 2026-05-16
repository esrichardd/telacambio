const features = [
  {
    icon: "📋",
    title: "Tu colección, organizada",
    desc: "Marca las que tienes, las que te faltan y las repetidas. Todo en un solo lugar.",
  },
  {
    icon: "🔍",
    title: "Encuentra a quien cambiar",
    desc: "Busca por ciudad quién tiene lo que necesitas y ofrece lo que a ellos les falta.",
  },
  {
    icon: "💬",
    title: "Coordina por WhatsApp",
    desc: "Genera tu lista de cambio con un toque y compártela directo desde la app.",
  },
];

export default function Features() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="text-center p-6 rounded-2xl bg-surface border border-border"
          >
            <div className="text-4xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
