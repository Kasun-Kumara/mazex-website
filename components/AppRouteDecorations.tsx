"use client";

import { usePathname } from "next/navigation";
import VerticalBrandText from "@/components/VerticalBrandText";
import WhatsAppButton from "@/components/WhatsAppButton";

function shouldHideRouteDecorations(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signin")
  );
}

export default function AppRouteDecorations() {
  const pathname = usePathname();

  if (shouldHideRouteDecorations(pathname)) {
    return null;
  }

  return (
    <>
      <VerticalBrandText />
      <WhatsAppButton />
    </>
  );
}
