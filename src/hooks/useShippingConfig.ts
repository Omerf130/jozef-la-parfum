import { useEffect, useState } from "react";

interface ShippingConfig {
  shippingPriceILS: number;
  freeShippingThreshold: number;
}

const DEFAULTS: ShippingConfig = { shippingPriceILS: 30, freeShippingThreshold: 499 };

let cached: ShippingConfig | null = null;
let pending: Promise<ShippingConfig> | null = null;

function fetchConfig(): Promise<ShippingConfig> {
  if (!pending) {
    pending = fetch("/api/shipping-config")
      .then((r) => (r.ok ? r.json() : DEFAULTS))
      .then((data: ShippingConfig) => {
        cached = data;
        return data;
      })
      .catch(() => DEFAULTS);
  }
  return pending;
}

export function useShippingConfig(): ShippingConfig & { loading: boolean } {
  const [config, setConfig] = useState<ShippingConfig>(cached ?? DEFAULTS);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) {
      setConfig(cached);
      setLoading(false);
      return;
    }
    fetchConfig().then((c) => {
      setConfig(c);
      setLoading(false);
    });
  }, []);

  return { ...config, loading };
}
