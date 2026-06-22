"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";

// Prefix-based: hides navbar on /login, /admin, /admin/dashboard, and any future /admin/* routes
const HIDDEN_PREFIXES = ["/login", "/admin"];

export function NavbarWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) {
    return null;
  }
  return <Navbar />;
}
