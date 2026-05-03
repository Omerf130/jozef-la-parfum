import type { Metadata, Viewport } from "next";
import { Heebo, Frank_Ruhl_Libre } from "next/font/google";
import "@/styles/globals.scss";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const display = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "700"],
});

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Jozef La Parfum";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — בוטיק בשמים יוקרתי`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "בוטיק בשמים יוקרתי בישראל. בשמים מקוריים מהמותגים המובילים בעולם, משלוח לכל הארץ ושירות אישי.",
  keywords: ["בשמים", "פרפיום", "בושם לגבר", "בושם לאישה", "בשמים יוקרה"],
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "בוטיק בשמים יוקרתי בישראל.",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
