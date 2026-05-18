"use client";

import { useState, useEffect, useRef, useMemo, useId } from "react";

// ---------------------------------------------------------------------------
// Helper — normaliza strings para comparación sin tildes/mayúsculas
// ---------------------------------------------------------------------------
function normalize(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface CityComboboxProps {
  value: string;
  cities: string[];
  loading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onChange: (city: string) => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
export default function CityCombobox({
  value,
  cities,
  loading = false,
  disabled = false,
  placeholder = "Escribe tu ciudad",
  onChange,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inputId = useId();

  // ---------------------------------------------------------------------------
  // Ciudades filtradas — limitadas para no saturar el DOM
  // ---------------------------------------------------------------------------
  const filtered = useMemo<string[]>(() => {
    if (!value.trim()) return cities.slice(0, 80);
    const q = normalize(value);
    return cities.filter((c) => normalize(c).includes(q));
  }, [cities, value]);

  // ---------------------------------------------------------------------------
  // Cerrar al hacer clic fuera
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // ---------------------------------------------------------------------------
  // Scroll al ítem resaltado
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (highlightedIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[highlightedIndex] as
      | HTMLElement
      | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  // ---------------------------------------------------------------------------
  // Resetear highlight cuando cambia la lista filtrada
  // ---------------------------------------------------------------------------
  const prevFilteredLength = useRef(filtered.length);
  useEffect(() => {
    if (prevFilteredLength.current !== filtered.length) {
      prevFilteredLength.current = filtered.length;
      setHighlightedIndex(-1);
    }
  }, [filtered.length]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
    setOpen(true);
    setHighlightedIndex(-1);
  }

  function handleFocus() {
    setOpen(true);
  }

  function handleSelect(city: string) {
    onChange(city);
    setOpen(false);
    setHighlightedIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) {
          setOpen(true);
          break;
        }
        setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (open && highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex]);
        } else {
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const showDropdown = open && !loading && !disabled && filtered.length > 0;
  const showEmpty =
    open &&
    !loading &&
    !disabled &&
    value.trim() !== "" &&
    filtered.length === 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={`${inputId}-listbox`}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `${inputId}-option-${highlightedIndex}`
            : undefined
        }
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || loading}
        className="w-full px-4 py-3 rounded-xl bg-surface-subtle border border-border text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
      />

      {/* Dropdown */}
      {showDropdown && (
        <ul
          ref={listRef}
          id={`${inputId}-listbox`}
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-border bg-surface shadow-xl"
        >
          {filtered.map((c, i) => (
            <li
              key={c}
              id={`${inputId}-option-${i}`}
              role="option"
              aria-selected={i === highlightedIndex}
              onPointerDown={(e) => {
                // Evita que el input pierda el foco antes del clic
                e.preventDefault();
                handleSelect(c);
              }}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors select-none ${
                i === highlightedIndex
                  ? "bg-brand/15 text-brand"
                  : "text-foreground hover:bg-surface-subtle"
              }`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}

      {/* Estado vacío — no hay match */}
      {showEmpty && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 px-4 py-3 rounded-xl border border-border bg-surface shadow-xl text-sm text-muted">
          Sin resultados para &ldquo;{value}&rdquo;
        </div>
      )}
    </div>
  );
}
