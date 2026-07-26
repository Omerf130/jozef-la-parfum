import type { FieldErrors, FieldValues } from "react-hook-form";

function collectErrorPaths(errors: FieldErrors<FieldValues>, prefix = ""): string[] {
  const paths: string[] = [];

  for (const key of Object.keys(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = errors[key];

    if (!val || typeof val !== "object") continue;

    if ("message" in val && val.message) {
      paths.push(path);
      continue;
    }

    paths.push(...collectErrorPaths(val as FieldErrors<FieldValues>, path));
  }

  return paths;
}

function findFieldElement(path: string): HTMLElement | null {
  const byId = document.getElementById(path);
  if (byId) return byId;

  const byName = document.querySelector<HTMLElement>(`[name="${path}"]`);
  if (byName) return byName;

  const bracketName = path.replace(/\.(\d+)\./g, "[$1].").replace(/\.(\d+)$/, "[$1]");
  return document.querySelector<HTMLElement>(`[name="${bracketName}"]`);
}

export function scrollToFirstError(errors: FieldErrors<FieldValues>): void {
  const paths = collectErrorPaths(errors);
  if (paths.length === 0) return;

  for (const path of paths) {
    const el = findFieldElement(path);
    if (!el) continue;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof el.focus === "function") {
      el.focus({ preventScroll: true });
    }
    return;
  }
}
