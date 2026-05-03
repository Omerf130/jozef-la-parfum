import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
