interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ["Tu perfil", "Ubicación", "Cómo intercambias"];

export default function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  return (
    <div className="mb-6">
      {/* Barra de progreso */}
      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < currentStep ? "bg-brand" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Texto de paso */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Paso{" "}
          <span className="font-semibold text-foreground">{currentStep}</span>{" "}
          de {totalSteps}
        </p>
        <p className="text-xs font-medium text-brand">
          {STEP_LABELS[currentStep - 1]}
        </p>
      </div>
    </div>
  );
}
