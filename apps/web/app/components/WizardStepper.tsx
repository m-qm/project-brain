"use client";

type WizardStepperProps = {
  steps: readonly string[];
  current: number;
  onStepChange?: (index: number) => void;
};

export function WizardStepper({ steps, current, onStepChange }: WizardStepperProps) {
  const total = steps.length;
  const progress = total <= 1 ? 100 : (current / (total - 1)) * 100;

  return (
    <nav className="wizard-stepper" aria-label="Wizard progress">
      <div className="wizard-stepper-meta">
        <span className="wizard-stepper-phase">
          Step {current + 1} of {total}
        </span>
        <span className="wizard-stepper-current">{steps[current]}</span>
      </div>

      <div className="wizard-progress-track" aria-hidden>
        <div className="wizard-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <ol className="wizard-stepper-list">
        {steps.map((label, i) => {
          const state =
            i < current ? "done" : i === current ? "active" : "upcoming";
          const canJump = onStepChange && i <= current;

          return (
            <li
              key={label}
              className={`wizard-step wizard-step-${state}`}
              aria-current={i === current ? "step" : undefined}
            >
              {canJump ? (
                <button
                  type="button"
                  className="wizard-step-button"
                  onClick={() => onStepChange(i)}
                  title={`Go to ${label}`}
                >
                  <span className="wizard-step-marker">
                    {state === "done" ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                        <path
                          d="M2.5 7.2 5.4 10 11.5 3.8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="wizard-step-label">{label}</span>
                </button>
              ) : (
                <span className="wizard-step-static">
                  <span className="wizard-step-marker">{i + 1}</span>
                  <span className="wizard-step-label">{label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
