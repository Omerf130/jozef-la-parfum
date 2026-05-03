import styles from "./Spinner.module.scss";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 32, label = "טוען" }: SpinnerProps) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <span
        className={styles.spinner}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
