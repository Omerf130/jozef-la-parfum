"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ADMIN_PRODUCTS_SCROLL_KEY } from "@/features/admin/constants";

interface StoredScroll {
  scrollY: number;
  q: string;
  page: number;
}

interface ProductsListScrollRestoreProps {
  q?: string;
  page: number;
}

export function ProductsListScrollRestore({ q = "", page }: ProductsListScrollRestoreProps) {
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ADMIN_PRODUCTS_SCROLL_KEY);
      if (!raw) return;

      const stored = JSON.parse(raw) as StoredScroll;
      if (stored.q !== q || stored.page !== page) {
        sessionStorage.removeItem(ADMIN_PRODUCTS_SCROLL_KEY);
        return;
      }

      sessionStorage.removeItem(ADMIN_PRODUCTS_SCROLL_KEY);

      const restore = () => window.scrollTo(0, stored.scrollY);
      requestAnimationFrame(() => {
        requestAnimationFrame(restore);
      });
    } catch {
      sessionStorage.removeItem(ADMIN_PRODUCTS_SCROLL_KEY);
    }
  }, [q, page]);

  return null;
}

interface ProductEditLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  listQ?: string;
  listPage: number;
}

export function ProductEditLink({
  href,
  className,
  children,
  listQ = "",
  listPage,
}: ProductEditLinkProps) {
  function saveScroll() {
    try {
      const payload: StoredScroll = {
        scrollY: window.scrollY,
        q: listQ,
        page: listPage,
      };
      sessionStorage.setItem(ADMIN_PRODUCTS_SCROLL_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  return (
    <Link href={href} className={className} onClick={saveScroll}>
      {children}
    </Link>
  );
}
