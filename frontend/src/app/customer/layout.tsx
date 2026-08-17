
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="customer-layout">
      <main className="customer-content">
        {children}
      </main>
    </div>
  );
}