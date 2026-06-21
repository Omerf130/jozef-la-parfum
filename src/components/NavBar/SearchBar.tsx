"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./SearchBar.module.scss";

interface SearchResult {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  image: string | null;
  price: number;
  salePrice: number | null;
}

export function SearchBar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/products/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data.results ?? []);
          setOpen(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useCallback(
    (slug: string) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      onNavigate?.();
      router.push(`/product/${slug}`);
    },
    [router, onNavigate],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      navigate(results[activeIdx].slug);
    }
  }

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrap}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className={styles.input}
          placeholder="חיפוש בשמים..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(-1);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="חיפוש מוצרים"
          aria-expanded={open}
          autoComplete="off"
        />
        {loading && <span className={styles.spinner} />}
      </div>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {results.length === 0 ? (
            <div className={styles.empty}>לא נמצאו תוצאות</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r._id}
                type="button"
                className={`${styles.result} ${i === activeIdx ? styles.active : ""}`}
                role="option"
                aria-selected={i === activeIdx}
                onClick={() => navigate(r.slug)}
                onMouseEnter={() => setActiveIdx(i)}
              >
                {r.image && (
                  <Image
                    src={r.image}
                    alt={r.name}
                    width={44}
                    height={44}
                    className={styles.thumb}
                  />
                )}
                <div className={styles.info}>
                  <span className={styles.name}>{r.name}</span>
                  <span className={styles.brand}>{r.brand}</span>
                </div>
                <div className={styles.price}>
                  {r.salePrice ? (
                    <>
                      <span className={styles.sale}>{formatPrice(r.salePrice)}</span>
                      <span className={styles.original}>{formatPrice(r.price)}</span>
                    </>
                  ) : (
                    <span>{formatPrice(r.price)}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
