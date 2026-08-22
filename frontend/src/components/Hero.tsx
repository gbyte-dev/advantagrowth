"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <section className="mx-auto flex min-h-[85vh] max-w-7xl items-center px-6">
      <div className="max-w-2xl">
       

        <h1 className="mt-6 text-6xl font-bold leading-tight">
          Manage Your Restaurant
          <br />
          With One Powerful Dashboard
        </h1>

        <p className="mt-6 text-lg text-gray-600">
          Billing, Orders, Tables, Kitchen, Inventory and Reports —
          everything in one modern cloud POS.
        </p>

        {!isLoggedIn && (
          <div className="mt-10 flex gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-black px-8 py-4 text-white"
            >
              Start Free
            </Link>

          </div>
        )}
      </div>
    </section>
  );
}