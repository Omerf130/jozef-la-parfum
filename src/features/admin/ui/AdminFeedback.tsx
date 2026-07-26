import styles from "./AdminFeedback.module.scss";

interface AdminFeedbackProps {
  variant: "success" | "error";
  message: string;
  className?: string;
}

export function AdminFeedback({ variant, message, className }: AdminFeedbackProps) {
  return (
    <p
      className={[styles.feedback, styles[variant], className].filter(Boolean).join(" ")}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {message}
    </p>
  );
}
