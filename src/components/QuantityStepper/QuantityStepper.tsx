"use client";

import styles from "./QuantityStepper.module.scss";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  ariaLabel?: string;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  ariaLabel = "כמות",
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className={styles.stepper} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={styles.btn}
        aria-label="הפחת"
      >
        −
      </button>
      <span className={styles.value} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        className={styles.btn}
        aria-label="הוסף"
      >
        +
      </button>
    </div>
  );
}
