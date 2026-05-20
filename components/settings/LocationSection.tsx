"use client";

import { useState, useTransition } from "react";
import StepLocation from "@/components/onboarding/StepLocation";
import { updateLocationAction } from "@/app/actions/profile";

interface LocationSectionProps {
  initialCountry: string;
  initialState: string;
  initialCity: string;
}

export default function LocationSection({
  initialCountry,
  initialState,
  initialCity,
}: LocationSectionProps) {
  const [countryCode, setCountryCode] = useState(initialCountry);
  const [stateCode, setStateCode] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange(
    field: "country_code" | "state_code" | "city",
    value: string,
  ) {
    setSaved(false);
    if (field === "country_code") {
      setCountryCode(value);
      setStateCode("");
      setCity("");
    } else if (field === "state_code") {
      setStateCode(value);
      setCity("");
    } else {
      setCity(value);
    }
  }

  function handleSave() {
    startTransition(async () => {
      await updateLocationAction(countryCode, stateCode, city);
      setSaved(true);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <StepLocation
        countryCode={countryCode}
        stateCode={stateCode}
        city={city}
        onChange={handleChange}
      />

      <div className="flex items-center justify-between gap-3">
        {saved && (
          <p className="text-xs text-brand">✓ Ubicación guardada.</p>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="ml-auto py-2 px-5 rounded-full bg-brand text-white text-sm font-medium hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Guardando…" : "Guardar ubicación"}
        </button>
      </div>
    </div>
  );
}
