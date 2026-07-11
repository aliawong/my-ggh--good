import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Inquiry, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 20;

export default async function DashboardOverview() {
  const supabase = await createClient();

  const [{ data: products }, { data: openInquiries }, { data: sales }] =
    await Promise.all([
      supabase.from("products").select("*").order("stock_qty", { ascending: true }),
      supabase
        .from("inquiries")
        .select("*, products(id, name, price, stock_qty)")
        .neq("status", "resolved")
        .order("created_at", { ascending: false }),
      supabase.from("sales").select("total_amount, quantity"),
    ]);

  const lowStock = ((products as Product[]) ?? []).filter(
    (p) => p.stock_qty != null && p.stock_qty <= LOW_STOCK_THRESHOLD,
  );
  const totalRevenue = (sales ?? []).reduce(
    (sum, s) => sum + Number(s.total_amount ?? 0),
    0,
  );
  const totalUnits = (sales ?? []).reduce(
    (sum, s) => sum + Number(s.quantity ?? 0),
    0,
  );

  const cards = [
    { label: "Open inquiries", value: (openInquiries ?? []).length },
    { label: "Low stock products", value: lowStock.length },
    { label: "Units sold", value: totalUnits },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}` },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand-800">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Needs attention</h2>
            <Link
              href="/dashboard/inquiries"
              className="text-sm text-brand-700 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-neutral-100">
            {((openInquiries as Inquiry[]) ?? []).slice(0, 5).map((inq) => (
              <li key={inq.id} className="py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">
                    {inq.customer_name}{" "}
                    <span className="text-neutral-400 font-normal">
                      · {inq.products?.name ?? "General"}
                    </span>
                  </p>
                  <span
                    className={
                      inq.status === "new"
                        ? "text-xs rounded-full bg-amber-100 text-amber-800 px-2 py-0.5"
                        : "text-xs rounded-full bg-blue-100 text-blue-800 px-2 py-0.5"
                    }
                  >
                    {inq.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-1">
                  {inq.message}
                </p>
              </li>
            ))}
            {((openInquiries as Inquiry[]) ?? []).length === 0 && (
              <p className="text-sm text-neutral-500 py-3">
                No open inquiries. 🎉
              </p>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Low stock</h2>
            <Link
              href="/dashboard/products"
              className="text-sm text-brand-700 hover:underline"
            >
              Manage products
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-neutral-100">
            {lowStock.slice(0, 6).map((p) => (
              <li
                key={p.id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <span className="font-medium">{p.name}</span>
                <span
                  className={
                    p.stock_qty === 0
                      ? "text-red-600 font-semibold"
                      : "text-amber-700 font-semibold"
                  }
                >
                  {p.stock_qty} left
                </span>
              </li>
            ))}
            {lowStock.length === 0 && (
              <p className="text-sm text-neutral-500 py-3">
                All products are well stocked.
              </p>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
