import Script from "next/script";

export function UserWayWidget() {
  return (
    <Script
      src="https://cdn.userway.org/widget.js"
      data-account={process.env.NEXT_PUBLIC_USERWAY_ACCOUNT_ID}
      strategy="afterInteractive"
    />
  );
}
