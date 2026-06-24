import type { OrderDoc } from "@/models/Order";

export interface PayPlusLineItem {
  name: string;
  quantity: number;
  price: number;
}

function round2(n: number): number {
  return Number(n.toFixed(2));
}

export function sumPayPlusItems(items: PayPlusLineItem[]): number {
  return round2(items.reduce((sum, it) => sum + it.price * it.quantity, 0));
}

export function buildPayPlusItems(order: OrderDoc): PayPlusLineItem[] {
  const items: PayPlusLineItem[] = order.items.map((it) => ({
    name: `${it.name} (${it.ml} ml)`,
    quantity: it.quantity,
    price: round2(it.unitPrice),
  }));

  if (order.shippingPrice > 0) {
    items.push({
      name: "משלוח",
      quantity: 1,
      price: round2(order.shippingPrice),
    });
  }

  if (order.discountAmount > 0) {
    items.push({
      name: order.couponCode ? `הנחה (${order.couponCode})` : "הנחה",
      quantity: 1,
      price: round2(-order.discountAmount),
    });
  }

  return items;
}

export function assertPayPlusItemsMatchTotal(order: OrderDoc, items: PayPlusLineItem[]): void {
  const itemsSum = sumPayPlusItems(items);
  const expected = round2(order.total);
  const diff = Math.abs(itemsSum - expected);
  if (diff > 0.01) {
    console.error("[payplus] items sum mismatch", {
      orderId: order._id.toString(),
      expected,
      itemsSum,
      subtotal: order.subtotal,
      shippingPrice: order.shippingPrice,
      discountAmount: order.discountAmount,
      items,
    });
    throw new Error("PayPlus items total does not match order total");
  }
}
