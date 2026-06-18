"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useCart } from "@/store/cart";
import styles from "./CouponField.module.scss";

interface CouponFieldProps {
  items: Array<{ productId: string; ml: number; quantity: number }>;
  customerEmail?: string;
  className?: string;
}

export function CouponField({ items, customerEmail, className }: CouponFieldProps) {
  const appliedCoupon = useCart((s) => s.appliedCoupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const clearCoupon = useCart((s) => s.clearCoupon);

  const [code, setCode] = useState(appliedCoupon?.code ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(!!appliedCoupon);

  useEffect(() => {
    if (appliedCoupon) {
      setCode(appliedCoupon.code);
      setIsValid(true);
    }
  }, [appliedCoupon]);

  useEffect(() => {
    if (!appliedCoupon) return;
    void validateApplied(appliedCoupon.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, customerEmail]);

  async function validateApplied(couponCode: string) {
    if (!couponCode.trim() || items.length === 0) {
      clearCoupon();
      setIsValid(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          items,
          customerEmail: customerEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        clearCoupon();
        setIsValid(false);
        setMessage(data.message || data.error || "קוד קופון לא תקין");
        return;
      }

      setCoupon({
        code: data.couponCode,
        appliesTo: data.appliesTo,
        discountAmount: data.discountAmount,
        shippingPrice: data.preview?.shippingPrice,
        total: data.preview?.total,
      });
      setIsValid(true);
      setMessage(data.message);
    } catch {
      setMessage("שגיאה בבדיקת הקופון");
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  }

  async function apply() {
    if (!code.trim()) return;
    setMessage(null);
    await validateApplied(code.trim());
  }

  function remove() {
    clearCoupon();
    setCode("");
    setIsValid(false);
    setMessage(null);
  }

  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <div className={styles.row}>
        <Input
          label="קוד קופון"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          dir="ltr"
          disabled={loading}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={isValid ? remove : apply}
          loading={loading}
          className={styles.applyBtn}
        >
          {isValid ? "הסר" : "החל"}
        </Button>
      </div>

      {message ? (
        <p className={isValid ? styles.success : styles.error}>{message}</p>
      ) : null}
    </div>
  );
}
