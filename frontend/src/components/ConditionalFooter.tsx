"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Pages where footer should be HIDDEN
  const hideFooterPaths = [
    "/login",
    "/owner/login",
    "/owner/login",
    "/superadmin/login",
    "/register",
    "/owner/register",
    "/dashboard",
    "/staff/dashboard",
    "/superadmin/dashboard",
    "/forgot-password",
  ];

  // Check if current path should hide footer
  const shouldHideFooter = hideFooterPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}