"use client";

import { Button } from "../Button";
import styles from "./ErrorState.module.scss";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "אירעה שגיאה",
  description = "לא הצלחנו לטעון את המידע. ניתן לנסות שוב.",
  onRetry,
  retryLabel = "ניסיון נוסף",
}: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.icon} aria-hidden="true">!</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {onRetry ? (
        <Button onClick={onRetry} variant="ghost">
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
