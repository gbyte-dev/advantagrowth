"use client";

import Link from "next/link";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import api from "@/lib/axios";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

const alwaysAvailablePages = [
  "/dashboard/subscriptions",
  "/dashboard/weather",
  "/dashboard/restaurant",
  "/dashboard/profile",
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [
    hasActiveSubscription,
    setHasActiveSubscription,
  ] = useState<boolean | null>(null);

  const [checkingAccess, setCheckingAccess] =
    useState(true);

  const [accessError, setAccessError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const checkSubscriptionAccess =
      async () => {
        setCheckingAccess(true);
        setAccessError("");

        const token =
          sessionStorage.getItem("token");

        if (!token) {
          router.replace("/owner/login");
          return;
        }

        try {
          const response = await api.get(
            "/owner/subscriptions"
          );

          if (cancelled) {
            return;
          }

          setHasActiveSubscription(
            Boolean(
              response.data
                ?.current_subscription
            )
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          const requestError =
            error as {
              response?: {
                status?: number;
                data?: {
                  message?: string;
                };
              };
            };

          if (
            requestError.response
              ?.status === 401
          ) {
            sessionStorage.clear();

            router.replace(
              "/owner/login"
            );

            return;
          }

          setAccessError(
            requestError.response
              ?.data?.message ||
              "Unable to verify subscription access."
                   );
        } finally {
          if (!cancelled) {
            setCheckingAccess(false);
          }
        }
      };

    checkSubscriptionAccess();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const isAlwaysAvailable =
    alwaysAvailablePages.some(
      (page) =>
        pathname === page ||
        pathname?.startsWith(`${page}/`)
    );

    if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-emerald-600" />

          <p className="mt-3 text-sm text-slate-600">
            Checking subscription access...
          </p>
        </div>
      </div>
    );
  }

  if (accessError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <i className="fas fa-circle-exclamation text-3xl text-red-500" />

          <h1 className="mt-3 text-lg font-bold text-slate-900">
            Unable to verify access
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {accessError}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (
    hasActiveSubscription === false &&
    !isAlwaysAvailable
  ) {
    return (
      <div className="owner-layout">
        <OwnerSidebar />

        <main className="owner-main-content">
          <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-lg rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <i className="fas fa-lock text-2xl" />
              </div>

              <h1 className="mt-5 text-2xl font-bold text-slate-900">
                No active subscription
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                Purchase an active subscription
                plan to use this section of your
                restaurant dashboard.
              </p>

              <Link
                href="/dashboard/subscriptions"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-emerald-700"
              >
                <i className="fas fa-credit-card" />
                View Subscription Plans
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main-content">
        {children}
      </main>
    </div>
  );
}