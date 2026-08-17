// components/OwnerLayout.tsx
"use client";

import { useState } from "react";
import OwnerSidebar from "@/components/owner/OwnerSidebar";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  if (typeof window !== "undefined") {
    window.addEventListener("sidebarToggle", ((e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    }) as EventListener);
  }

  return (
    <div className="owner-layout">
      <OwnerSidebar />
      <main className={`owner-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : ""}`}>
        <div className="dashboard-page">
          <div className="dashboard-container">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}