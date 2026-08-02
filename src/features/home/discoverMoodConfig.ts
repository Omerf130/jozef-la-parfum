/**
 * VISUAL PLACEHOLDER NOTICE
 * -------------------------
 * The four `image` paths below currently reuse existing site photography
 * for development only. Final visual approval requires four dedicated
 * campaign images:
 *   - public/mood/fresh.jpg
 *   - public/mood/elegant.jpg
 *   - public/mood/bold.jpg
 *   - public/mood/discover.jpg
 * Each must have distinct emotional art direction — do not ship final QA until those exist.
 *
 * Copy note: titles honestly describe the existing category destination.
 * These blocks are editorial invitations, not mood filters.
 */
export const DISCOVER_MOOD = {
  eyebrow: "DISCOVER",
  headline: "איך תרצו להרגיש היום?",
  support: "לפעמים הניחוח הנכון מתחיל בתחושה הנכונה.",
  ctaLabel: "לגלות →",
  worlds: [
    {
      label: "FRESH",
      title: "רעננות נשית",
      href: "/category/women",
      image: "/editorial-perfume.jpg",
      objectPosition: "center 35%",
      rhythm: "spreadOne",
      composition: "bottomRight",
    },
    {
      label: "ELEGANT",
      title: "אלגנטיות גברית",
      href: "/category/men",
      image: "/categories/all-perfumes.jpg",
      objectPosition: "center 42%",
      rhythm: "spreadTwo",
      composition: "topLeft",
    },
    {
      label: "BOLD",
      title: "נוכחות ללא הגדרה",
      href: "/category/unisex",
      image: "/categories/budget-perfumes.jpg",
      objectPosition: "center 40%",
      rhythm: "spreadThree",
      composition: "centerLeft",
    },
    {
      label: "DISCOVER",
      title: "לכל מצב רוח",
      href: "/category/all",
      image: "/editorial-perfume.jpg",
      objectPosition: "center 55%",
      rhythm: "spreadFour",
      composition: "bottomLeft",
    },
  ],
} as const;

export type MoodRhythm = (typeof DISCOVER_MOOD.worlds)[number]["rhythm"];
export type MoodComposition = (typeof DISCOVER_MOOD.worlds)[number]["composition"];
export type MoodWorldConfig = (typeof DISCOVER_MOOD.worlds)[number];
