import { forwardRef, SelectHTMLAttributes } from "react";
import styles from "./Select.module.scss";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, id, className, ...rest },
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
      <select
        id={inputId}
        ref={ref}
        className={`${styles.select} ${error ? styles.error : ""}`}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className={styles.errorText}>{error}</p> : null}
    </div>
  );
});
