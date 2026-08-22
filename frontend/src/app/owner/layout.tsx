export default function OwnerAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="owner-scope">
      {children}
    </div>
  );
}
