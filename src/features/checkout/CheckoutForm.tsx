"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { EmptyState } from "@/components/EmptyState";
import { useCart } from "@/store/cart";
import { formatILS } from "@/lib/format";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation/checkout";
import styles from "./CheckoutForm.module.scss";

const SHIPPING_PRICE = Number(process.env.NEXT_PUBLIC_SHIPPING_PRICE_ILS || 0);
const FREE_SHIPPING_THRESHOLD = 499;

export function CheckoutForm() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);

  const [hydrated, setHydrated] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: { country: "IL" },
      items: [],
    },
  });

  const shippingPrice =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
  const total = subtotal + shippingPrice;

  if (!hydrated) {
    return <div className={styles.loading}>טוען…</div>;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="העגלה ריקה"
        description="לא ניתן להמשיך לתשלום ללא פריטים."
        action={
          <Link href="/category/women">
            <Button variant="secondary">לחנות</Button>
          </Link>
        }
      />
    );
  }

  async function onSubmit(values: CheckoutInput) {
    setServerError(null);
    setSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((i) => ({
            productId: i.productId,
            ml: i.ml,
            quantity: i.quantity,
          })),
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "יצירת הזמנה נכשלה");
      }

      const orderId = orderData.order?._id;

      const payRes = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || "יצירת דף תשלום נכשלה");
      }

      clear();

      if (payData.url) {
        window.location.href = payData.url as string;
      } else {
        router.push("/payment/cancel");
      }
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "שגיאה בלתי צפויה");
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.layout} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.fields}>
        <section className={styles.section}>
          <h2>פרטי לקוח</h2>
          <Input
            label="שם מלא"
            {...register("customerName")}
            error={errors.customerName?.message}
            autoComplete="name"
          />
          <div className={styles.row}>
            <Input
              label='דוא"ל'
              type="email"
              {...register("customerEmail")}
              error={errors.customerEmail?.message}
              autoComplete="email"
              dir="ltr"
            />
            <Input
              label="טלפון"
              type="tel"
              {...register("customerPhone")}
              error={errors.customerPhone?.message}
              placeholder="050-1234567"
              autoComplete="tel"
              dir="ltr"
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2>כתובת למשלוח</h2>
          <Input
            label="רחוב ומספר"
            {...register("shippingAddress.street")}
            error={errors.shippingAddress?.street?.message}
            autoComplete="street-address"
          />
          <div className={styles.row}>
            <Input
              label="עיר"
              {...register("shippingAddress.city")}
              error={errors.shippingAddress?.city?.message}
              autoComplete="address-level2"
            />
            <Input
              label="מיקוד"
              {...register("shippingAddress.zip")}
              error={errors.shippingAddress?.zip?.message}
              autoComplete="postal-code"
              dir="ltr"
            />
          </div>
          <input type="hidden" {...register("shippingAddress.country")} value="IL" />
        </section>

        {serverError ? <div className={styles.serverError}>{serverError}</div> : null}
      </div>

      <aside className={styles.summary}>
        <h2>סיכום</h2>
        <ul className={styles.summaryItems}>
          {items.map((it) => (
            <li key={`${it.productId}-${it.ml}`}>
              <span className={styles.summaryName}>
                {it.brand} {it.name}
                <small>
                  {it.ml} מ&quot;ל × {it.quantity}
                </small>
              </span>
              <span>{formatILS(it.unitPrice * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className={styles.row2}>
          <span>סכום ביניים</span>
          <span>{formatILS(subtotal)}</span>
        </div>
        <div className={styles.row2}>
          <span>משלוח</span>
          <span>{shippingPrice === 0 ? "חינם" : formatILS(shippingPrice)}</span>
        </div>
        <div className={`${styles.row2} ${styles.totalRow}`}>
          <span>סה&quot;כ</span>
          <span>{formatILS(total)}</span>
        </div>
        <Button type="submit" loading={submitting} fullWidth size="lg">
          תשלום מאובטח
        </Button>
        <p className={styles.secure}>תועבר/י לדף תשלום מוגן של PayPlus</p>
      </aside>
    </form>
  );
}
