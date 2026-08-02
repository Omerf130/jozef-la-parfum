export const HERO_CONFIG = {
  label: "ÉVOIR · COLLECTION",
  headline: "נוכחות שנשארת.",
  support: "בחירה מדויקת של ניחוחות שנועדו להשאיר רושם.",
  cta: {
    label: "לגלות את הקולקציה",
    href: "/category/women",
  },
  intervalMs: 6000,
  crossfadeMs: 1400,
  passageMs: 520,
  /** Default focal point — protects subject above text block */
  defaultObjectPosition: "center 42%",
  /**
   * Optional per-slide layout hints (index-aligned).
   * Add entries when a specific admin upload needs composition adjustment.
   */
  slideLayouts: [] as Array<{
    objectPosition?: string;
    /** Shift text block within lower safe band */
    contentPlacement?: "default" | "lower" | "higher";
    /** When subject sits inline-start, move text inline-end */
    textSide?: "start" | "end";
  }>,
} as const;

export function getSlideObjectPosition(index: number): string {
  return (
    HERO_CONFIG.slideLayouts[index]?.objectPosition ??
    HERO_CONFIG.defaultObjectPosition
  );
}

export function getSlideContentPlacement(index: number): "default" | "lower" | "higher" {
  return HERO_CONFIG.slideLayouts[index]?.contentPlacement ?? "default";
}

export function getSlideTextSide(index: number): "start" | "end" {
  return HERO_CONFIG.slideLayouts[index]?.textSide ?? "start";
}
