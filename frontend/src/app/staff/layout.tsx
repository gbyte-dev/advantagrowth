
export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="owner-layout">

      <main className="owner-content">
        {children}
      </main>
    </div>
  );
}