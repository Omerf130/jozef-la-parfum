"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import {
  COOKIE_CONSENT_ACCEPTED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
} from "@/components/CookieConsent/CookieConsent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const isDev = process.env.NODE_ENV !== "production";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function hasConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) === "accepted";
}

export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (hasConsent()) {
      setEnabled(true);
    }

    function onConsentAccepted() {
      setEnabled(true);
    }

    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onConsentAccepted);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onConsentAccepted);
    };
  }, []);

  useEffect(() => {
    if (isDev && enabled && GA_ID) {
      console.log("[GA] initialized", GA_ID);
    }
  }, [enabled]);

  // Track client-side navigations (App Router doesn't re-send page_view on soft nav).
  useEffect(() => {
    if (!enabled || !GA_ID || typeof window.gtag !== "function") return;
    const page_path = pathname + window.location.search;
    window.gtag("event", "page_view", { page_path });
    if (isDev) {
      console.log("[GA] page_view", page_path);
    }
  }, [pathname, enabled]);

  if (!GA_ID || !enabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
