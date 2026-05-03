import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./Input.module.scss";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        ref={ref}
        className={`${styles.input} ${error ? styles.error : ""}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {hint && !error ? <p className={styles.hint}>{hint}</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className={`${styles.field} ${className ?? ""}`}>
      {label ? (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        ref={ref}
        rows={4}
        className={`${styles.input} ${styles.textarea} ${error ? styles.error : ""}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {hint && !error ? <p className={styles.hint}>{hint}</p> : null}
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
});
