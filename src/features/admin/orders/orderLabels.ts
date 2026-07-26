export function paymentLabel(status: string): string {
  return (
    { paid: "שולם", pending: "ממתין", failed: "נכשל", refunded: "זוכה" }[status] ||
    status
  );
}

export function orderStatusLabel(status: string): string {
  return (
    {
      new: "חדש",
      processing: "בטיפול",
      shipped: "נשלח",
      delivered: "נמסר",
      cancelled: "בוטל",
    }[status] || status
  );
}

export function formatOrderId(id: string, compact = false): string {
  const slice = compact ? 6 : 8;
  return `#${id.slice(-slice).toUpperCase()}`;
}
