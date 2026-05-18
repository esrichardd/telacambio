"use client";

import { forwardRef, useState, InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  showToggle?: boolean; // muestra el ojito para ver/ocultar contraseña
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, hint, id, className, showToggle, type, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    const inputType = showToggle
      ? visible ? "text" : "password"
      : type;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={`w-full px-4 py-3 rounded-xl bg-surface-subtle border text-sm text-foreground placeholder:text-muted outline-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15 ${
              showToggle ? "pr-11" : ""
            } ${error ? "border-red-500/60" : "border-border"} ${className ?? ""}`}
            {...props}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors p-1"
              tabIndex={-1}
              aria-label={visible ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {visible ? (
                // Ojo abierto
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                // Ojo cerrado
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <span>✕</span> {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  },
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
