"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import formActionStyles from "./AdminFormActions.module.scss";

interface AdminFormActionsProps {
  saveLabel: string;
  loading?: boolean;
  backHref: string;
  backLabel?: string;
  onBackClick?: () => void;
  renderExtra?: () => ReactNode;
}

export function adminFormStickyClassName(): string {
  return formActionStyles.formWithStickyActions;
}

export function AdminFormActions({
  saveLabel,
  loading,
  backHref,
  backLabel = "חזרה",
  onBackClick,
  renderExtra,
}: AdminFormActionsProps) {
  const extra = renderExtra?.();

  return (
    <>
      {extra ? <div className={formActionStyles.mobileExtra}>{extra}</div> : null}
      <div className={formActionStyles.bar}>
        <div className={formActionStyles.primaryActions}>
          <Button type="submit" loading={loading} size="lg">
            {saveLabel}
          </Button>
          {onBackClick ? (
            <Button type="button" variant="ghost" size="lg" onClick={onBackClick}>
              {backLabel}
            </Button>
          ) : (
            <Link href={backHref} className={formActionStyles.backLink}>
              {backLabel}
            </Link>
          )}
        </div>
        {extra ? <div className={formActionStyles.desktopExtra}>{extra}</div> : null}
      </div>
    </>
  );
}
