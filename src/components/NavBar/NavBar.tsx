import { getShippingConfig } from "@/lib/siteSettings";
import { SITE_NAME } from "@/lib/siteName";
import { NavBarChrome } from "./NavBarChrome";

const NAV_LINKS = [
  { href: "/", label: "בית" },
  { href: "/category/all", label: "כל הבשמים" },
  { href: "/category/men", label: "לגבר" },
  { href: "/category/women", label: "לאישה" },
  { href: "/category/unisex", label: "יוניסקס" },
  { href: "/category/budget", label: 'בשמים עד 150 ש"ח' },
  { href: "/about", label: "אודות" },
  { href: "/contact", label: "צור קשר" },
];

export async function NavBar() {
  const { freeShippingThreshold } = await getShippingConfig();

  const announcements = [
    `משלוח חינם מעל ₪${freeShippingThreshold}`,
    "משלוח מגיע עד 7 ימי עסקים",
    "החזרות והחלפות עד 14 יום",
    "תשלומים ללא ריבית",
  ];

  return (
    <NavBarChrome siteName={SITE_NAME} announcements={announcements} links={NAV_LINKS} />
  );
}
