"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import AuthSelect from "@/components/auth/AuthSelect";
import CityCombobox from "@/components/onboarding/CityCombobox";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface Country {
  iso2: string;
  name: string;
  emoji?: string;
}

interface State {
  stateCode: string;
  name: string;
}

interface DetectedLocation {
  country: string | null;
  region: string | null;
  city: string | null;
}

interface StepLocationProps {
  countryCode: string;
  stateCode: string;
  city: string;
  onChange: (
    field: "country_code" | "state_code" | "city",
    value: string,
  ) => void;
}

// ---------------------------------------------------------------------------
// Helper — normaliza strings para comparación sin tildes/mayúsculas
// ---------------------------------------------------------------------------
function normalize(s: string | null | undefined): string {
  if (s == null || s === "") return "";
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export default function StepLocation({
  countryCode,
  stateCode,
  city,
  onChange,
}: StepLocationProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Guardamos datos junto con la clave (país/estado) para la que se cargaron.
  // El loading se deriva de si la clave coincide con la selección actual —
  // así no necesitamos llamar setState de forma síncrona dentro de efectos.
  const [statesData, setStatesData] = useState<{
    country: string;
    list: State[];
  } | null>(null);

  const [citiesData, setCitiesData] = useState<{
    country: string;
    state: string;
    list: string[];
  } | null>(null);

  const [detected, setDetected] = useState<DetectedLocation | null>(null);
  const [geolocating, setGeolocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Ref estable para onChange — actualizado en un efecto, nunca durante el render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  // Flags para evitar auto-relleno repetido
  const autoFilledCountry = useRef(false);
  const autoFilledState = useRef(false);
  const autoFilledCity = useRef(false);

  // Resetear flags de estado/ciudad cuando cambia el país
  const prevCountryRef = useRef(countryCode);
  useEffect(() => {
    if (prevCountryRef.current !== countryCode) {
      prevCountryRef.current = countryCode;
      autoFilledState.current = false;
      autoFilledCity.current = false;
    }
  }, [countryCode]);

  // Resetear flag de ciudad cuando cambia el estado
  const prevStateRef = useRef(stateCode);
  useEffect(() => {
    if (prevStateRef.current !== stateCode) {
      prevStateRef.current = stateCode;
      autoFilledCity.current = false;
    }
  }, [stateCode]);

  // ---------------------------------------------------------------------------
  // Loading derivado — sin setState síncrono en efectos
  // ---------------------------------------------------------------------------
  const loadingStates = !!countryCode && statesData?.country !== countryCode;
  const loadingCities =
    !!countryCode &&
    !!stateCode &&
    (citiesData?.country !== countryCode || citiesData?.state !== stateCode);

  // ---------------------------------------------------------------------------
  // Datos derivados con useMemo — estables entre renders
  // ---------------------------------------------------------------------------
  const states = useMemo<State[]>(
    () => (statesData?.country === countryCode ? statesData.list : []),
    [statesData, countryCode],
  );

  const cities = useMemo<string[]>(
    () =>
      citiesData?.country === countryCode && citiesData?.state === stateCode
        ? citiesData.list
        : [],
    [citiesData, countryCode, stateCode],
  );

  // ---------------------------------------------------------------------------
  // Carga inicial: países + detección silenciosa por IP
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetch("/api/geo/countries")
      .then((r) => r.json())
      .then((data: Country[]) => {
        setCountries(data);
        setLoadingCountries(false);
      })
      .catch(() => setLoadingCountries(false));

    fetch("/api/geo/detect")
      .then((r) => r.json())
      .then((data: DetectedLocation | null) => {
        if (data?.country) setDetected(data);
      })
      .catch(() => {});
  }, []);

  // ---------------------------------------------------------------------------
  // Carga de estados — solo setState en callbacks async
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!countryCode) return;
    fetch(`/api/geo/states?country=${encodeURIComponent(countryCode)}`)
      .then((r) => r.json())
      .then((data: State[]) => {
        setStatesData({ country: countryCode, list: data });
      })
      .catch(() => {
        setStatesData({ country: countryCode, list: [] });
      });
  }, [countryCode]);

  // ---------------------------------------------------------------------------
  // Carga de ciudades — solo setState en callbacks async
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!countryCode || !stateCode) return;
    fetch(
      `/api/geo/cities?country=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(stateCode)}`,
    )
      .then((r) => r.json())
      .then((data: string[]) => {
        setCitiesData({ country: countryCode, state: stateCode, list: data });
      })
      .catch(() => {
        setCitiesData({ country: countryCode, state: stateCode, list: [] });
      });
  }, [countryCode, stateCode]);

  // ---------------------------------------------------------------------------
  // Auto-relleno de país
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      autoFilledCountry.current ||
      !detected?.country ||
      countries.length === 0 ||
      countryCode
    )
      return;

    const match = countries.find((c) => c.iso2 === detected.country);
    if (match) {
      autoFilledCountry.current = true;
      onChangeRef.current("country_code", match.iso2);
    }
  }, [detected, countries, countryCode]);

  // ---------------------------------------------------------------------------
  // Auto-relleno de estado
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      autoFilledState.current ||
      !detected?.region ||
      states.length === 0 ||
      stateCode ||
      city ||
      detected.country !== countryCode
    )
      return;

    const normalized = normalize(detected.region);
    const match = states.find(
      (s) => typeof s.name === "string" && normalize(s.name) === normalized,
    );
    if (match) {
      autoFilledState.current = true;
      onChangeRef.current("state_code", match.stateCode);
    }
  }, [detected, states, stateCode, countryCode]);

  // ---------------------------------------------------------------------------
  // Auto-relleno de ciudad
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (
      autoFilledCity.current ||
      !detected?.city ||
      cities.length === 0 ||
      city
    )
      return;

    const normalized = normalize(detected.city);
    const match = cities.find(
      (c) => typeof c === "string" && normalize(c) === normalized,
    );
    if (match) {
      autoFilledCity.current = true;
      onChangeRef.current("city", match);
    }
  }, [detected, cities, city]);

  // ---------------------------------------------------------------------------
  // Geolocalización GPS (solo cuando el usuario hace clic)
  // ---------------------------------------------------------------------------
  function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoError("Tu dispositivo no soporta geolocalización.");
      return;
    }
    setGeolocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `/api/geo/reverse?lat=${coords.latitude}&lng=${coords.longitude}`,
          );
          const data = await res.json();
          if (!data?.country_code) throw new Error("Sin datos de ubicación");

          autoFilledCountry.current = false;
          autoFilledState.current = false;
          autoFilledCity.current = false;

          setDetected({
            country: data.country_code,
            region: data.state ?? null,
            city: data.city ?? null,
          });

          if (data.country_code !== countryCode) {
            onChangeRef.current("country_code", data.country_code);
          }
        } catch {
          setGeoError("No pudimos determinar tu ubicación. Intenta de nuevo.");
        } finally {
          setGeolocating(false);
        }
      },
      () => {
        setGeoError(
          "Permiso denegado. Puedes seleccionar tu ubicación manualmente.",
        );
        setGeolocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false },
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-4">
      {/* País */}
      <AuthSelect
        id="country"
        label="País"
        value={countryCode}
        placeholder={
          loadingCountries ? "Cargando países…" : "Selecciona tu país"
        }
        onChange={(e) => {
          autoFilledCountry.current = true;
          onChange("country_code", e.target.value);
        }}
        disabled={loadingCountries}
        hint="Usamos esto para conectarte con coleccionistas cercanos."
      >
        {countries.map((c) => (
          <option key={c.iso2} value={c.iso2}>
            {c.emoji ? `${c.emoji} ` : ""}
            {c.name}
          </option>
        ))}
      </AuthSelect>

      {/* Botón de geolocalización GPS */}
      {!loadingCountries && (
        <div className="flex items-center gap-2 -mt-1">
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={geolocating}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-brand transition-colors disabled:opacity-50"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {geolocating ? "Detectando…" : "Usar mi ubicación exacta"}
          </button>
          {detected && !geolocating && (
            <span className="text-xs text-brand/60">· Ubicación detectada</span>
          )}
        </div>
      )}

      {geoError && <p className="text-xs text-red-400">{geoError}</p>}

      {/* Estado / Departamento */}
      {countryCode && (
        <AuthSelect
          id="state"
          label="Estado / Departamento"
          value={stateCode}
          placeholder={
            loadingStates
              ? "Cargando…"
              : states.length === 0
                ? "Sin estados disponibles"
                : "Selecciona tu estado"
          }
          onChange={(e) => {
            autoFilledState.current = true;
            onChange("state_code", e.target.value);
          }}
          disabled={loadingStates || states.length === 0}
        >
          {states.map((s, i) => (
            <option key={s.stateCode || `state-${i}`} value={s.stateCode}>
              {s.name}
            </option>
          ))}
        </AuthSelect>
      )}

      {/* Ciudad */}
      {(stateCode || (countryCode && city)) && (
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Ciudad</label>
          <CityCombobox
            value={city}
            cities={cities}
            loading={loadingCities}
            disabled={!stateCode}
            placeholder={
              loadingCities
                ? "Cargando ciudades…"
                : stateCode
                  ? "Escribe tu ciudad"
                  : "Selecciona un estado primero"
            }
            onChange={(val) => {
              autoFilledCity.current = true;
              onChange("city", val);
            }}
          />
          {stateCode && !loadingCities && (
            <p className="text-xs text-muted">
              {cities.length > 0
                ? `${cities.length} ciudades disponibles — escribe para buscar`
                : "No se encontraron ciudades para este estado"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
