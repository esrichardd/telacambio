interface AuthAlertProps {
  type: "error" | "success" | "info";
  message: string;
}

export default function AuthAlert({ type, message }: AuthAlertProps) {
  const styles = {
    error: "bg-red-500/8 border-red-500/20 text-red-400",
    success: "bg-brand/8 border-brand/20 text-brand",
    info: "bg-foreground/5 border-border text-muted",
  };

  const icons = {
    error: "✕",
    success: "✓",
    info: "ℹ",
  };

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm border flex items-start gap-2.5 ${styles[type]}`}
    >
      <span className="mt-0.5 flex-shrink-0 font-bold text-xs">
        {icons[type]}
      </span>
      <span>{message}</span>
    </div>
  );
}
