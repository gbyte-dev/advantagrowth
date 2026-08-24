"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (pathname === "/superadmin/login") {
            setChecking(false);
            return;
        }

        const token = sessionStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "super_admin") {
            router.replace("/superadmin/login");
            return;
        }

        setChecking(false);
    }, [pathname, router]);

    if (pathname !== "/superadmin/login" && checking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
            </div>
        );
    }

    return <>{children}</>;
}
