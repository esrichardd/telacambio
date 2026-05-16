import { ButtonHTMLAttributes } from "react";

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
}

export default function AuthButton({
  loading,
  children,
  disabled,
  variant = "primary",
  className,
  ...props
}: AuthButtonProps) {
  const base =
    "w-full py-3 px-4 rounded-full font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer";

  const variants = {
    primary:
      "bg-brand text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed",
    ghost:
      "bg-transparent border border-border text-foreground hover:bg-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed",
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          <span>Cargando…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
