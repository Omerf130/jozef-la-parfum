import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.userway.org",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.userway.org",
      "font-src 'self' https://fonts.gstatic.com https://cdn.userway.org",
      "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://images.unsplash.com https://cdn.userway.org",
      "connect-src 'self' https://restapi.payplus.co.il https://restapidev.payplus.co.il https://cdn.userway.org https://api.userway.org",
      "frame-src https://payments.payplus.co.il https://paymentsdev.payplus.co.il https://cdn.userway.org",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
