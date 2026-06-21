"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchBar } from "./SearchBar";
import styles from "./MobileMenu.module.scss";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  links: NavLink[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-label="פתיחת תפריט"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>
      {open ? (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.panel} role="dialog" aria-label="תפריט ניווט">
            <div className={styles.head}>
              <span className={styles.headTitle}>תפריט</span>
              <button
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="סגירת תפריט"
              >
                ×
              </button>
            </div>
            <div className={styles.search}>
              <SearchBar onNavigate={() => setOpen(false)} />
            </div>
            <nav className={styles.links}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={styles.link}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
