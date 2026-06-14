"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import styles from "./CategoryFilters.module.scss";

interface FiltersProps {
  brands: string[];
  priceBounds: { min: number; max: number };
  currentParams: {
    brand?: string;
    gender?: string;
    conc?: string;
    min?: string;
    max?: string;
  };
}

function FilterToggleIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <path d="M18 6L6 18M6 6l12 12" />
      ) : (
        <>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="16" y2="12" />
          <line x1="4" y1="18" x2="12" y2="18" />
        </>
      )}
    </svg>
  );
}

const GENDERS = [
  { value: "male", label: "לגבר" },
  { value: "female", label: "לאישה" },
  { value: "unisex", label: "יוניסקס" },
];

const CONCS = [
  { value: "EDT", label: "EDT" },
  { value: "EDP", label: "EDP" },
  { value: "Parfum", label: "Parfum" },
  { value: "Cologne", label: "Cologne" },
];

export function CategoryFilters({ brands, priceBounds, currentParams }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [brand, setBrand] = useState(currentParams.brand || "");
  const [gender, setGender] = useState(currentParams.gender || "");
  const [conc, setConc] = useState(currentParams.conc || "");
  const [minPrice, setMinPrice] = useState(currentParams.min || "");
  const [maxPrice, setMaxPrice] = useState(currentParams.max || "");

  function apply() {
    const sp = new URLSearchParams(params.toString());
    sp.delete("page");
    if (brand) sp.set("brand", brand);
    else sp.delete("brand");
    if (gender) sp.set("gender", gender);
    else sp.delete("gender");
    if (conc) sp.set("conc", conc);
    else sp.delete("conc");
    if (minPrice) sp.set("min", minPrice);
    else sp.delete("min");
    if (maxPrice) sp.set("max", maxPrice);
    else sp.delete("max");
    const qs = sp.toString();
    startTransition(() => {
      router.push(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  }

  function reset() {
    setBrand("");
    setGender("");
    setConc("");
    setMinPrice("");
    setMaxPrice("");
    startTransition(() => router.push(pathname));
  }

  return (
    <div className={styles.filters}>
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="category-filters-body"
      >
        <FilterToggleIcon open={mobileOpen} />
        <span>{mobileOpen ? "סגור סינון" : "סינון"}</span>
      </button>
      <div
        id="category-filters-body"
        className={`${styles.body} ${mobileOpen ? styles.open : ""}`}
      >
      <h3 className={styles.title}>סינון</h3>

      {brands.length > 0 ? (
        <div className={styles.group}>
          <h4>יצרן</h4>
          <div className={styles.options}>
            <label className={styles.option}>
              <input
                type="radio"
                name="brand"
                checked={brand === ""}
                onChange={() => setBrand("")}
              />
              <span>הכל</span>
            </label>
            {brands.map((b) => (
              <label key={b} className={styles.option}>
                <input
                  type="radio"
                  name="brand"
                  checked={brand === b}
                  onChange={() => setBrand(b)}
                />
                <span>{b}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.group}>
        <h4>מין</h4>
        <div className={styles.options}>
          <label className={styles.option}>
            <input
              type="radio"
              name="gender"
              checked={gender === ""}
              onChange={() => setGender("")}
            />
            <span>הכל</span>
          </label>
          {GENDERS.map((g) => (
            <label key={g.value} className={styles.option}>
              <input
                type="radio"
                name="gender"
                checked={gender === g.value}
                onChange={() => setGender(g.value)}
              />
              <span>{g.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <h4>ריכוז</h4>
        <div className={styles.options}>
          <label className={styles.option}>
            <input
              type="radio"
              name="conc"
              checked={conc === ""}
              onChange={() => setConc("")}
            />
            <span>הכל</span>
          </label>
          {CONCS.map((c) => (
            <label key={c.value} className={styles.option}>
              <input
                type="radio"
                name="conc"
                checked={conc === c.value}
                onChange={() => setConc(c.value)}
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <h4>טווח מחירים (₪)</h4>
        <div className={styles.priceRow}>
          <input
            type="number"
            min={priceBounds.min}
            max={priceBounds.max}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={`מ-${priceBounds.min}`}
            className={styles.priceInput}
          />
          <span>—</span>
          <input
            type="number"
            min={priceBounds.min}
            max={priceBounds.max}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={`עד-${priceBounds.max}`}
            className={styles.priceInput}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button onClick={apply} loading={pending} fullWidth>
          החל סינון
        </Button>
        <Button onClick={reset} variant="ghost" fullWidth>
          איפוס
        </Button>
      </div>
      </div>
    </div>
  );
}
