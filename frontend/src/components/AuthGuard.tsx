"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Handle missing or invalid values
    if (!token || token === "undefined") {
      router.replace("/login");
      return;
    }

    if (!role || role === "undefined") {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(role)) {
      router.replace("/");
      return;
    }

    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) return null;

  return <>{children}</>;
}