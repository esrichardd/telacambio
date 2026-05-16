"use client";

import { forwardRef, SelectHTMLAttributes } from "react";

interface AuthSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

const AuthSelect = forwardRef<HTMLSelectElement, AuthSelectProps>(
  (
    { label, error, hint, placeholder, id, children, className, ...props },
    ref,
  ) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={`w-full px-4 py-3 rounded-xl bg-surface-subtle border text-sm text-foreground outline-none appearance-none transition-all duration-150 focus:border-brand focus:ring-2 focus:ring-brand/15 cursor-pointer ${
              error ? "border-red-500/60" : "border-border"
            } ${props.value === "" ? "text-muted" : "text-foreground"} ${className ?? ""}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          {/* Chevron */}
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className="text-muted"
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
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

AuthSelect.displayName = "AuthSelect";

export default AuthSelect;
