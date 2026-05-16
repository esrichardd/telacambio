const stats = [
  { value: "630", label: "barajitas en el álbum" },
  { value: "48", label: "selecciones del mundo" },
  { value: "3", label: "países sede" },
];

export default function StatsBar() {
  return (
    <div className="bg-surface border-y border-border py-8">
      <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl font-bold text-brand">{s.value}</p>
            <p className="text-sm text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
