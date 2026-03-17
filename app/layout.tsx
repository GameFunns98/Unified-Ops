import Link from "next/link";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/roster", label: "Roster" },
  { href: "/shifts", label: "Shifts" },
  { href: "/tickets", label: "Tickets" }
];

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
          <header style={{ marginBottom: 20 }}>
            <h1 style={{ marginBottom: 12 }}>Unified Ops MVP</h1>
            <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
