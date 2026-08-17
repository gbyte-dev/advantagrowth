"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import TopBar from "@/components/TopBar";

export default function MainNavigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");

      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener(
        "storage",
        checkAuth
      );
    };
  }, []);

  if (isLoggedIn) {
    return <TopBar />;
  }

  return <Navbar />;
}