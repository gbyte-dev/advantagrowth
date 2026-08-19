import OwnerSidebar from "@/components/owner/OwnerSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="owner-layout">
      <OwnerSidebar />

      <main className="owner-main-content">
        {children}
      </main>
    </div>
  );
}