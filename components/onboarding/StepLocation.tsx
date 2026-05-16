"use client";

import AuthSelect from "@/components/auth/AuthSelect";
import {
  COLOMBIA_DEPARTAMENTOS,
  getCiudadesByDepartamento,
} from "@/lib/constants/colombia";

interface StepLocationProps {
  departamento: string;
  city: string;
  onChange: (field: "departamento" | "city", value: string) => void;
}

export default function StepLocation({
  departamento,
  city,
  onChange,
}: StepLocationProps) {
  const ciudades = getCiudadesByDepartamento(departamento);

  function handleDepartamentoChange(value: string) {
    onChange("departamento", value);
    onChange("city", ""); // resetear ciudad al cambiar departamento
  }

  return (
    <div className="flex flex-col gap-4">
      {/* País fijo */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">País</label>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-subtle border border-border">
          <span className="text-lg">🇨🇴</span>
          <span className="text-sm text-foreground">Colombia</span>
          <span className="ml-auto text-xs text-muted bg-border/60 px-2 py-0.5 rounded-full">
            Próximamente más países
          </span>
        </div>
      </div>

      {/* Departamento */}
      <AuthSelect
        id="departamento"
        label="Departamento"
        value={departamento}
        placeholder="Selecciona tu departamento"
        onChange={(e) => handleDepartamentoChange(e.target.value)}
        hint="Usamos esto para conectarte con coleccionistas cercanos."
      >
        {COLOMBIA_DEPARTAMENTOS.map((d) => (
          <option key={d.code} value={d.name}>
            {d.name}
          </option>
        ))}
      </AuthSelect>

      {/* Ciudad — solo aparece si hay departamento seleccionado */}
      {departamento && (
        <AuthSelect
          id="city"
          label="Ciudad"
          value={city}
          placeholder="Selecciona tu ciudad"
          onChange={(e) => onChange("city", e.target.value)}
        >
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </AuthSelect>
      )}
    </div>
  );
}
