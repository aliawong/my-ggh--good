import Link from "next/link";

const tabs = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
  { href: "/dashboard/products", label: "Products & Stock" },
  { href: "/dashboard/sales", label: "Sales" },
  { href: "/dashboard/reports", label: "Reports" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight text-brand-800">
        Sales Rep Dashboard
      </h1>
      <nav className="mt-4 flex gap-1 border-b border-neutral-200 text-sm font-medium overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-2 rounded-t-lg hover:bg-brand-50 hover:text-brand-700 whitespace-nowrap"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
